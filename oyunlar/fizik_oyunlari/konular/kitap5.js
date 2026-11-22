// Kitap düzeninde HİKÂYE + SORU SİSTEMİ + TUZAK · TYT Elektrostatik (durgun elektrik, elektriksel kuvvet, elektrik alan) ·
// Elektrik ve Manyetizma (akım–direnç, Ohm, üreteçler, güç, lambalar, mıknatıslar)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');

  // ----------------- ELEKTROSTATİK: mevcut iki iletken küre sahnesi -----------------
  const sEs = FZ.taban('TYT', 'Elektrostatik');
  const dk = (S, a, b, ra = 0.6, rb = 0.6, d = 4) => Object.assign(S, { qa: a, qb: b, ra, rb, d, dok: 0, faz: 0, paylasti: 0 });
  const he = ders(sEs, { yk: 'TYT6-d7', no: 7, icon: '📖', name: 'Hikâye: Kış sabahı — kapı kolu çarpınca', task: 'Yük, iletken–yalıtkan, dokunma ile yük paylaşımı, Coulomb kuvveti, uzaklıkla değişim, elektrik alan.', notlar: ['Yük korunur; dokunan iletkenler yükü yarıçapla orantılı paylaşır.', 'F = k·q₁·q₂/d² · E = k·q/d² · alan çizgileri (+)\'dan çıkar.'], steps: [
    { do: S => dk(S, 6, -2), sub: 'Kış sabahı Ece yün kazağını çıkarıp kapı koluna dokununca çarpıldı. Okulda öğretmeni iki metal küreyle aynı olayı gösterdi: K küresi +6q, L küresi −2q.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Neden çarpıldı?', m: ['Kazağa sürtünen Ece\'nin vücudu yüklendi. Metal kola dokununca yükler iletken üzerinden hızla aktı: küçük bir kıvılcım.', 'İletkenlerde (metal, insan vücudu) yükler hareket edebilir; yalıtkanlarda (plastik, cam) konduğu yerde kalır.'] } },
    { k: { tur: 'kavram', b: 'Coulomb kuvveti', f: ['e6F', 'e6F2'], m: [`${FM(`F = k ${F('q<sub>1</sub> · q<sub>2</sub>', 'd<sup>2</sup>')}`)} · zıt yükler çeker, aynı yükler iter.`, 'İki küreye etki eden kuvvetler eşit büyüklükte ve zıt yönlüdür (yükleri farklı olsa bile).'] } },
    { p: { t: 'Küreler birbirine dokundurulup eski yerlerine konursa aralarındaki kuvvet nasıl olur?', o: ['Çekme olarak kalır', 'İtme olur', 'Sıfır olur', 'Değişmez'], d: 1 } },
    { sub: 'Küreleri dokunduralım.', go: '▶︎ Dokundur' },
    { do: S => { S.dok = 1; }, sub: 'Yükler paylaşılıyor…', until: S => S.faz >= 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Toplam yük korunur', f: ['e6a', 'e6b'], m: ['Toplam: +6q − 2q = +4q → özdeş kürelerde ikiye bölünür: her biri +2q.', 'Artık ikisi de (+): kuvvet <em>itme</em> oldu. Büyüklük: k · 2q · 2q / d² = 4kq²/d² (önce 12kq²/d²) → F\'nin 1/3\'ü.'] } },
    { do: S => dk(S, 9, 0, 0.4, 0.8), sub: 'Öğretmen şimdi küçük (r) +9q yüklü küreyi büyük (2r) nötr küreye dokunduruyor.', go: '▶︎ Dokundur' },
    { do: S => { S.dok = 1; }, sub: 'Paylaşım…', until: S => S.faz >= 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yarıçapla orantılı paylaşım', f: ['e6a', 'e6b'], m: [`${FM(`${F('q<sub>1</sub>', 'q<sub>2</sub>')} = ${F('r<sub>1</sub>', 'r<sub>2</sub>')}`)} → 9q, 1 : 2 bölünür: <em>+3q</em> ve <em>+6q</em>.`, 'Neden? Dokunma sonunda iki kürenin potansiyelleri eşitlenir; V = kq/r olduğu için q ∝ r.'] } },
    { k: { tur: 'kavram', b: 'Elektrik alan', m: [`Yükün çevresindeki etki bölgesi: ${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)} · ${FM('F = q · E')}`, 'Alan çizgileri (+) yükten çıkar, (−) yüke girer; birbirini kesmez; sık olduğu yerde alan büyüktür.'] } },
    { k: { tur: 'dikkat', b: 'UYARI · İçten ve dıştan dokunma', m: ['İçi boş iletken kürenin <em>içine</em> dokunan iletken bütün yükünü verir (yük dış yüzeyde toplanır).', 'Topraklanan iletken yükünü toprağa verir; yakında yüklü cisim varsa zıt işaretle yüklü kalabilir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`Yük korunur · paylaşım ∝ r · ${FM(`F = k ${F('q<sub>1</sub>q<sub>2</sub>', 'd<sup>2</sup>')}`)} · ${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)}`] } },
  ] });
  const ge = gorev(sEs, { yk: 'TYT6-g4', no: 4, icon: '⚡', name: 'Soru sistemi: durgun elektrik, kuvvet, alan', task: 'Sırayla dokunma, farklı yarıçaplar, kuvvet oranı, uzaklık değişimi, elektroskop, alan.', steps: [
    { do: S => dk(S, 12, 0), sub: 'İki iletken küre.', go: '▶︎ Başlat' },
    { q: { t: 'Özdeş iletken K, L, M, N kürelerinin yükleri sırasıyla +16q, 0, 0, 0. K önce L\'ye, sonra M\'ye, sonra N\'ye dokundurulup ayrılıyor. Son durumda K\'nin yükü kaç q olur?', o: ['+2q', '+4q', '+8q', '+16q/3'],
      s: ['K–L: 8q, 8q · K–M: 4q, 4q · K–N: 2q, 2q', 'K = <em>+2q</em> ✓'], n: ['Özdeş kürede her dokunmada K\'nin yükü yarıya iner.'] } },
    { do: S => { dk(S, 9, -3, 0.4, 0.8); S.dok = 1; }, q: { t: 'Yarıçapı r olan +9q yüklü küre, yarıçapı 2r olan −3q yüklü küreye dokundurulup ayrılıyor. Küçük kürenin son yükü kaç q\'dur?', o: ['+2q', '+3q', '+4q', '+6q'], f: ['e6a', 'e6b'],
      s: ['Toplam +6q; 1 : 2 paylaşım', 'Küçük: <em>+2q</em>, büyük: +4q ✓'], n: ['Toplamı işaretiyle al, sonra yarıçap oranında böl.'] } },
    { do: S => dk(S, 6, -2), q: { t: 'Özdeş +6q ve −2q yüklü küreler d uzaklıkta F kuvvetiyle çekiliyor. Dokundurulup aynı yerlere konunca aralarındaki kuvvet kaç F olur?', o: [`${F('1', '3')} (itme)`, `${F('1', '3')} (çekme)`, 'F (itme)', `${F('4', '3')} (itme)`], f: ['e6F'],
      s: ['Önce: k · 6q · 2q / d² = 12kq²/d² = F', 'Sonra: +2q, +2q → 4kq²/d² = <em>F/3, itme</em> ✓'], n: ['Yük işaretleri aynı olunca kuvvet itmeye döner.'] } },
    { q: { t: 'İki noktasal yük arasındaki uzaklık 3 katına çıkarılır ve yüklerden biri 2 katına çıkarılırsa kuvvet kaç F olur?', o: [F('2', '9'), F('2', '3'), '6', F('1', '9')],
      s: [`F' = F · ${F('2', '3<sup>2</sup>')} = <em>${F('2', '9')} F</em> ✓`], n: ['F ∝ q₁q₂/d².'] } },
    { q: { t: 'Eşkenar üçgenin köşelerinde +q, +q ve −q yükleri var. −q yüküne etki eden bileşke kuvvetin yönü hakkında ne söylenebilir?', o: ['Diğer iki yükün orta noktasına doğrudur', 'Diğer iki yükün orta noktasından uzağa doğrudur', 'Sıfırdır', 'Yüklerden birine doğrudur'],
      s: ['Her iki +q yükü −q\'yu eşit kuvvetle kendine çeker.', 'Bileşke, iki kuvvetin açıortayında: iki +q\'nun <em>orta noktasına doğru</em> ✓'], n: ['Eşit büyüklükteki iki vektörün bileşkesi açıortay üzerindedir.'] } },
    { q: { t: '(+) yüklü elektroskoba (−) yüklü çubuk dokundurulup uzaklaştırılıyor. Çubuğun yükü elektroskobunkinden büyükse yapraklar son durumda nasıldır?', o: ['(−) yükle açıktır', '(+) yükle daha çok açıktır', 'Kapalıdır', 'Önce kapanır sonra (+) ile açılır'],
      s: ['Dokunmada toplam yük paylaşılır; çubuğun (−) yükü büyük → toplam (−).', 'Yapraklar <em>(−) yükle açık</em> ✓ (geçerken bir an kapanır)'], n: ['Dokunma ile elektriklenmede cisimler aynı işaretle yüklenir.'] } },
    { q: { t: '+q yükünden d uzaklıkta elektrik alan E\'dir. 2d uzaklıkta +4q yükünün oluşturduğu alan kaç E olur?', o: ['1', '2', '4', F('1', '2')],
      s: [`E' = k · 4q / (2d)² = kq/d² = <em>E</em> ✓`], n: ['E ∝ q/d²; yük 4 katı, uzaklık 2 katı → değişmez.'] } },
  ] });
  const te = gorev(sEs, { yk: 'TYT6-g5', no: 5, tuzak: true, icon: '🪤', name: 'Tuzak sorular · elektrostatik', task: 'Elektrostatikte en sık yapılan yanlışlar.', steps: [
    { do: S => dk(S, 4, 2), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: '+4q ve +2q yüklü iki küre arasındaki kuvvetler için hangisi doğrudur?', o: ['İki küreye etki eden kuvvetler eşittir', '+4q küresine daha büyük kuvvet etki eder', '+2q küresine daha büyük kuvvet etki eder', 'Kuvvetler yüklerle orantılı paylaşılır'], f: ['e6F', 'e6F2'],
      s: ['Etki–tepki: kuvvetler <em>eşit ve zıt</em> ✓'], n: ['TUZAK: yükü büyük olanın daha çok itildiğini sanmak.'] } },
    { q: { t: 'Nötr bir cisim yüklü bir çubuğa çekiliyorsa çubuğun yükü hakkında ne söylenebilir?', o: ['Çubuk (+) ya da (−) olabilir', 'Çubuk kesinlikle (+)\'dır', 'Çubuk kesinlikle (−)\'dir', 'Çubuk nötrdür'],
      s: ['Nötr cisim kutuplanır ve her yüklü cisme çekilir ✓'], n: ['TUZAK: çekilme gördüğünde "zıt yüklü" demek. Kesin bilgi yalnız itmeden çıkar.'] } },
    { q: { t: 'Cam çubuk ipeğe sürtülünce cam (+) yüklenir. Bunun nedeni hangisidir?', o: ['Camdan ipeğe elektron geçmesi', 'İpekten cama proton geçmesi', 'Camda proton oluşması', 'İpekten cama elektron geçmesi'],
      s: ['Katılarda hareket eden <em>elektrondur</em>: cam elektron kaybeder ✓'], n: ['TUZAK: proton aktarımı sanmak.'] } },
    { q: { t: 'Elektrik alan çizgileri için hangisi yanlıştır?', o: ['Birbirini keserler', '(+) yükten çıkarlar', 'Sık oldukları yerde alan büyüktür', '(−) yüke girerler'],
      s: ['Alan çizgileri <em>kesişmez</em>; bir noktada alanın tek yönü vardır ✓'], n: ['"Yanlıştır" diye sorulan soruda doğru ifadeyi işaretleme tuzağına dikkat.'] } },
  ] });
  FZ.konuEk('TYT', 'Elektrostatik', { dersler: [he], gorevler: [ge, te] });

  // ----------------- ELEKTRİK DEVRESİ + MIKNATIS SAHNESİ -----------------
  const direnc = (g) => { const a = new THREE.Group(); g.add(a); const b = silindir(a, 0.1, 0.1, 0.5, 0xe7d3a8, 0, 0, 0, { edge: false }); b.rotation.z = Math.PI / 2;
    [0x92400e, 0x111827, 0xdc2626, 0xd4a72c].forEach((c, i) => { const r = silindir(a, 0.105, 0.105, 0.04, c, -0.15 + i * 0.1, 0, 0, { edge: false }); r.rotation.z = Math.PI / 2; }); return a; };
  const olcer = (g, harf) => { const a = new THREE.Group(); g.add(a); const k = silindir(a, 0.28, 0.28, 0.15, 0x1f2937, 0, 0.075, 0); const y = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), new THREE.MeshBasicMaterial({ color: 0xfef9c3 })); y.rotation.x = -Math.PI / 2; y.position.y = 0.152; a.add(y);
    FZ.levha(a, harf, 0.22, 0.22, '#fef9c3', '#111827', 0, 0.16, 0).rotation.x = -Math.PI / 2; const ib = kutu(a, 0.01, 0.005, 0.18, 0xdc2626, 0, 0.16, -0.05, { edge: false }); a.ibre = ib; return a; };
  const anahtar = g => { const a = new THREE.Group(); g.add(a); kutu(a, 0.6, 0.06, 0.25, 0x374151, 0, 0.03, 0); const kol = new THREE.Group(); kol.position.set(-0.22, 0.1, 0); a.add(kol); kutu(kol, 0.44, 0.03, 0.04, 0x9ca3af, 0.22, 0, 0); a.kol = kol; return a; };
  const miknatis = (g, L = 1.6) => { const a = new THREE.Group(); g.add(a); kutu(a, L / 2, 0.3, 0.3, 0xdc2626, L / 4, 0.15, 0); kutu(a, L / 2, 0.3, 0.3, 0x2563eb, -L / 4, 0.15, 0);
    FZ.levha(a, 'N', 0.2, 0.2, '#dc2626', '#fff', L / 2 - 0.15, 0.31, 0).rotation.x = -Math.PI / 2; FZ.levha(a, 'S', 0.2, 0.2, '#2563eb', '#fff', -L / 2 + 0.15, 0.31, 0).rotation.x = -Math.PI / 2; return a; };
  const pusula = g => { const a = new THREE.Group(); g.add(a); silindir(a, 0.22, 0.22, 0.06, 0xd1d5db, 0, 0.03, 0); const ig = new THREE.Group(); ig.position.y = 0.08; a.add(ig);
    const n = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 8), new THREE.MeshLambertMaterial({ color: 0xdc2626 })); n.rotation.z = -Math.PI / 2; n.position.x = 0.09; ig.add(n);
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 8), new THREE.MeshLambertMaterial({ color: 0x2563eb })); s.rotation.z = Math.PI / 2; s.position.x = -0.09; ig.add(s); a.ig = ig; return a; };
  // devre: pil(ler) solda, R1, R2 (lamba) sağda; seri / paralel; ampermetre ana kolda; voltmetre R1'e paralel
  const sEl = sahne({ icon: '💡', cam: [[2.3, 7.5, 7.5], [2.3, 0, -0.2]], plate: [11, 5, 0, 0], data: [['Üreteç iç direnci', 'önemsiz']],
    cam2: S => S.mod === 'mikn' ? [[2.3, 6, 6.5], [2.3, 0, 0]] : null,
    S0: () => ({ mod: 'seri', V: 12, R1: 4, R2: 4, ac: 1, pil: 1, ters: 0, mk: 0, ayr: 0, it: 1 }),
    kur(g) {
      const G = { dev: new THREE.Group(), mikn: new THREE.Group() }; g.add(G.dev, G.mikn);
      kutu(G.dev, 6, 0.05, 3.4, 0xe7d3a8, 0, 0.025, 0, { edge: false });
      const piller = [0, 1].map(i => { const p = FZ.pil(G.dev, 0.9); p.rotation.x = -Math.PI / 2; return p; });
      const L1 = FZ.ampul(G.dev, 0.9), L2 = FZ.ampul(G.dev, 0.9);
      const A = olcer(G.dev, 'A'), Vm = olcer(G.dev, 'V'), an = anahtar(G.dev);
      const tel = []; for (let i = 0; i < 12; i++) { const l = FZ.cizgi(G.dev, 0x1f2937); l.material.dashSize = 100; l.material.gapSize = 0; tel.push(l); }
      const el = []; for (let i = 0; i < 18; i++) el.push(top(G.dev, 0.05, 0xef4444, 0, 0, 0, { edge: false, cast: false }));
      const m1 = miknatis(G.mikn), m2 = miknatis(G.mikn); const pus = []; for (let i = 0; i < 10; i++) pus.push(pusula(G.mikn));
      const cz = []; for (let i = 0; i < 12; i++) { const l = FZ.cizgi(G.mikn, 0x64748b); cz.push(l); }
      ['k5a', 'k5b', 'k5c', 'k5d', 'k5e'].forEach(i => etiket(i, '', '#334155')); kart('k5K', '', '#F5C400');
      return { G, piller, L1, L2, A, Vm, an, tel, el, m1, m2, pus, cz };
    },
    tick(S, dt, o) {
      const mk = S.mod === 'mikn'; o.G.dev.visible = !mk; o.G.mikn.visible = mk;
      if (!mk) {
        const par = S.mod === 'paralel', V = S.V * (S.pil === 2 ? (S.ters ? 0 : 2) : 1), y = 0.06;
        const Req = par ? S.R1 * S.R2 / (S.R1 + S.R2) : S.R1 + S.R2, I = S.ac ? V / Req : 0, I1 = par ? (S.ac ? V / S.R1 : 0) : I, I2 = par ? (S.ac ? V / S.R2 : 0) : I;
        const P1 = I1 * I1 * S.R1, P2 = I2 * I2 * S.R2; S.I = I; S.V1 = I1 * S.R1;
        o.piller.forEach((p, i) => { p.visible = i < S.pil; p.position.set(-2.4, 0.2, -0.5 + i * 1.0 * (S.pil === 2 ? 1 : 0)); p.rotation.z = (i === 1 && S.ters) ? Math.PI : 0; });
        const Y1 = -1.2, Y2 = 1.2;
        if (par) { o.L1.position.set(0.6, y, Y1 + 0.6); o.L2.position.set(1.8, y, Y1 + 0.6); } else { o.L1.position.set(0, y, Y1); o.L2.position.set(1.4, y, Y1); }
        o.L1.parla(Math.min(1, P1 / 36)); o.L2.parla(Math.min(1, P2 / 36)); o.L2.visible = S.R2 < 1e6;
        o.A.position.set(1.0, y, Y2); o.Vm.position.set(par ? 0.6 : 0, y, par ? 0.2 : -0.35); o.an.position.set(-0.8, y, Y2); o.an.kol.rotation.z = S.ac ? 0 : 0.6;
        o.A.ibre.rotation.y = -0.8 + Math.min(1.6, I * 0.4); o.Vm.ibre.rotation.y = -0.8 + Math.min(1.6, S.V1 * 0.12);
        const P = (a, b) => [V3(a[0], 0.08, a[1]), V3(b[0], 0.08, b[1])]; let segs;
        if (par) segs = [P([-2.4, Y1], [2.6, Y1]), P([-2.4, Y2], [2.6, Y2]), P([0.6, Y1], [0.6, Y2]), P([1.8, Y1], [1.8, Y2]), P([-2.4, Y1], [-2.4, -0.2]), P([-2.4, 0.6], [-2.4, Y2])];
        else segs = [P([-2.4, Y1], [2.6, Y1]), P([2.6, Y1], [2.6, Y2]), P([-2.4, Y2], [2.6, Y2]), P([-2.4, Y1], [-2.4, -0.2]), P([-2.4, (S.pil === 2 ? 1.0 : 0.6)], [-2.4, Y2]), P([-0.3, Y1], [-0.3, -0.35]), P([0.3, Y1], [0.3, -0.35])];
        o.tel.forEach((l, i) => { if (segs[i]) FZ.setLine(l, segs[i]); else l.visible = false; });
        S.u = (S.u || 0) + dt * I * 0.15; const yol = [V3(-2.4, 0.1, -0.2), V3(-2.4, 0.1, Y1), V3(2.6, 0.1, Y1), V3(2.6, 0.1, Y2), V3(-2.4, 0.1, Y2), V3(-2.4, 0.1, 0.6)].reverse(); let T = 0; const uz = []; for (let i = 1; i < yol.length; i++) { T += yol[i].distanceTo(yol[i - 1]); uz.push(T); }
        o.el.forEach((m, i) => { m.visible = I > 0 && !par; if (!m.visible) return; let s = ((S.u + i / o.el.length) % 1) * T, k = 0; while (k < uz.length - 1 && s > uz[k]) k++; const s0 = k ? uz[k - 1] : 0; m.position.copy(yol[k].clone().lerp(yol[k + 1], (s - s0) / (uz[k] - s0))); });
        FZ.setTag('k5a', `I = ${fs(I)} A`); FZ.show('k5a', o.A.position.clone().add(V3(0, 0.5, 0.45)), 1);
        FZ.setTag('k5b', `V<sub>1</sub> = ${fs(S.V1)} V`); FZ.show('k5b', o.Vm.position.clone().add(V3(0, 0.5, 0.45)), 1);
        FZ.setTag('k5c', `R<sub>1</sub> = ${S.R1} Ω`); FZ.show('k5c', o.L1.position.clone().add(V3(0, 1.0, 0)), 1);
        FZ.setTag('k5d', `R<sub>2</sub> = ${S.R2} Ω`); FZ.show('k5d', o.L2.position.clone().add(V3(0, 1.0, 0)), o.L2.visible ? 1 : 0);
        FZ.setTag('k5e', `ε = ${V} V`); FZ.show('k5e', V3(-3.0, 0.4, 0), 1);
        FZ.setTag('k5K', `${par ? 'Paralel' : 'Seri'} · R<sub>eş</sub> = ${fs(Req)} Ω · ${S.ac ? 'anahtar kapalı' : 'anahtar açık'}`); FZ.show('k5K', V3(0, 0.4, -2.2), 1);
      } else {
        const d = 1.2 + S.ayr; o.m1.position.set(-d / 2 - 0.8, 0, 0); o.m2.position.set(d / 2 + 0.8, 0, 0); o.m2.rotation.y = S.it ? Math.PI : 0;   // it: N–N karşı karşıya
        const q = []; const pm = m => { const R = m.rotation.y ? -1 : 1, x = m.position.x; q.push({ p: V3(x + R * 0.8, 0.15, 0), s: 1 }, { p: V3(x - R * 0.8, 0.15, 0), s: -1 }); }; pm(o.m1); pm(o.m2);
        const B = p => { const b = V3(); q.forEach(c => { const r = p.clone().sub(c.p); const l = Math.max(0.15, r.length()); b.add(r.multiplyScalar(c.s / (l * l * l))); }); return b; };
        o.pus.forEach((pu, i) => { const a = i / o.pus.length * Math.PI * 2, p = V3(Math.cos(a) * 3.2, 0, Math.sin(a) * 1.6); pu.position.copy(p); const b = B(p.clone().setY(0.15)); pu.ig.rotation.y = -Math.atan2(b.z, b.x); });
        o.cz.forEach((l, k) => { const c = q[k % 4]; if (c.s < 0) { l.visible = false; return; } const a0 = (k / 12) * Math.PI * 2; let p = c.p.clone().add(V3(Math.cos(a0) * 0.2, 0, Math.sin(a0) * 0.2)); const pts = [p.clone()];
          for (let s = 0; s < 120; s++) { const b = B(p); if (b.length() < 1e-4) break; p = p.clone().add(b.normalize().multiplyScalar(0.06)); pts.push(p); if (Math.abs(p.x) > 4.5 || Math.abs(p.z) > 2.4 || q.some(o2 => o2.s < 0 && o2.p.distanceTo(p) < 0.18)) break; } FZ.setLine(l, pts); });
        FZ.setTag('k5K', S.it ? 'Aynı kutuplar (N–N) birbirini iter' : 'Zıt kutuplar (N–S) birbirini çeker'); FZ.show('k5K', V3(0, 0.6, -2), 1);
      }
    },
    qp: () => V3(0, 1, -2) });
  const dv = (S, x) => Object.assign(S, { mod: 'seri', V: 12, R1: 4, R2: 4, ac: 1, pil: 1, ters: 0 }, x || {});
  const hd = ders(sEl, { yk: 'TYT7-d3', no: 3, icon: '📖', name: 'Hikâye: Ece\'nin el feneri ve buzdolabı mıknatısı', task: 'Akım, potansiyel farkı, direnç, Ohm yasası, seri–paralel bağlama, üreteç bağlama, ampermetre–voltmetre, elektrik enerjisi ve güç, mıknatıslar.', notlar: ['V = I · R · seri: R toplanır, akım aynı · paralel: 1/R toplanır, gerilim aynı.', 'P = V·I = I²R = V²/R · E = P · t · 1 kWh = 3,6·10⁶ J', 'Ampermetre seri, voltmetre paralel bağlanır.'], steps: [
    { do: S => dv(S, { ac: 0 }), sub: 'Elektrik kesildi. Ece el fenerinin pilini, iki ampulünü ve tellerini bir tahtaya dizip kendi lambasını kurmaya karar verdi.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Akım, gerilim, direnç', m: ['<em>Akım</em> (I, amper): birim zamanda geçen yük. Elektronlar (kırmızı) pilin (−) ucundan (+) ucuna akar; akım yönü (+)\'dan (−)\'ye kabul edilir.', '<em>Potansiyel farkı</em> (V, volt): yükleri iten "elektriksel basınç". <em>Direnç</em> (R, ohm): akıma karşı koyma.'] } },
    { sub: 'Anahtarı kapatalım.', go: '▶︎ Anahtarı kapat' },
    { do: S => { S.ac = 1; }, sub: 'Akım geçiyor; ampermetre ve voltmetre okunuyor.', wait: 2.5 },
    { k: { tur: 'kavram', b: 'Ohm yasası', f: ['k5a', 'k5b'], m: [`${FM('V = I · R')} · seri: ${FM('R<sub>eş</sub> = R<sub>1</sub> + R<sub>2</sub>')} = 8 Ω → I = 12 / 8 = <em>1,5 A</em>.`, 'Ampermetre devreye <em>seri</em> (akımı ölçer, direnci çok küçük), voltmetre elemana <em>paralel</em> (gerilimi ölçer, direnci çok büyük) bağlanır.'] } },
    { do: S => dv(S, { mod: 'paralel' }), sub: 'Ece ampulleri paralel bağladı.', wait: 2.5 },
    { k: { tur: 'gozlem', b: 'Paralelde daha parlak', f: ['k5K'], m: [`${FM(`${F('1', 'R<sub>eş</sub>')} = ${F('1', 'R<sub>1</sub>')} + ${F('1', 'R<sub>2</sub>')}`)} = 2 Ω → ana akım 6 A, her ampulden 3 A.`, 'Her ampulün uçlarında pilin tam gerilimi (12 V) var: P = V²/R = 36 W (seride 9 W). Evdeki lambalar paraleldir.'] } },
    { do: S => dv(S, { pil: 2 }), sub: 'Bir pil daha ekledi: önce seri (aynı yönde)…', wait: 2.5 },
    { do: S => { S.ters = 1; }, sub: '…sonra ters bağladı.', wait: 2.5 },
    { k: { tur: 'dikkat', b: 'UYARI · Üreteç bağlama', f: ['k5e', 'k5a'], m: ['Seri (aynı yönde) bağlı üreteçlerin gerilimleri <em>toplanır</em>; ters bağlananlar <em>çıkarılır</em> (özdeşlerse ε = 0).', 'Paralel bağlı özdeş üreteçlerin gerilimi bir üreteçinkine eşittir ama daha uzun süre dayanırlar.'] } },
    { k: { tur: 'kavram', b: 'Elektrik enerjisi ve güç', m: [`${FM('P = V · I = I<sup>2</sup> R')} · ${FM('E = P · t')} · lambanın parlaklığı gücüyle orantılıdır.`, '1 kWh = 1000 W · 3600 s = 3,6 · 10<sup>6</sup> J. 2000 W ısıtıcı 3 saatte 6 kWh harcar.'] } },
    { do: S => Object.assign(S, { mod: 'mikn', it: 0, ayr: 0.6 }), sub: 'Işıklar gelince Ece buzdolabındaki iki mıknatısı aldı ve etrafına pusulalar dizdi.', wait: 2.5 },
    { k: { tur: 'kavram', b: 'Mıknatıslar', f: ['k5K'], m: ['Her mıknatısın N ve S kutbu vardır; mıknatıs kırılsa da her parça yine N ve S kutuplu olur.', 'Zıt kutuplar çeker, aynı kutuplar iter. Alan çizgileri N\'den çıkar, S\'ye girer; pusula iğnesinin N ucu alan yönünü gösterir.'] } },
    { do: S => { S.it = 1; }, sub: 'Mıknatıslardan birini çevirdi: N kutupları karşı karşıya.', wait: 2.5 },
    { k: { tur: 'gunluk', b: 'Mıknatıs türleri ve kullanım', m: ['Doğal (manyetit), yapay kalıcı (çubuk, U, halka), elektromıknatıs (bobin + demir çekirdek, akım kesilince mıknatıslık biter).', 'Hurda ayırma, kapı zilleri, MR, hoparlör elektromıknatıs kullanır. Demir, nikel, kobalt çekilir; tahta, bakır, alüminyum çekilmez.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('V = I R')} · seri: akım aynı · paralel: gerilim aynı · ${FM('P = V I')} · 1 kWh = 3,6·10<sup>6</sup> J · N–S çeker, N–N iter.`] } },
  ] });
  const gd = gorev(sEl, { yk: 'TYT7-g3', no: 3, icon: '🔌', name: 'Soru sistemi: akım, direnç, Ohm, üreteç, güç', task: 'Direnç tablosu, eşdeğer direnç, ampermetre–voltmetre okuma, üreteç bağlama, lamba parlaklığı, kWh, mıknatıslar.', data: [['Üreteç iç direnci', 'önemsiz']], steps: [
    { do: S => dv(S), sub: 'Seri devre.', go: '▶︎ Başlat' },
    { q: { t: 'Aynı maddeden X (L, A), Y (2L, A), Z (L/2, 2A) telleri yapılıyor. Dirençleri arasındaki ilişki nedir?', o: ['R<sub>Y</sub> > R<sub>X</sub> > R<sub>Z</sub>', 'R<sub>X</sub> = R<sub>Y</sub> = R<sub>Z</sub>', 'R<sub>Z</sub> > R<sub>X</sub> > R<sub>Y</sub>', 'R<sub>X</sub> > R<sub>Y</sub> > R<sub>Z</sub>'],
      s: ['R = ρL/A: X → 1, Y → 2, Z → (½)/2 = ¼', '<em>R<sub>Y</sub> > R<sub>X</sub> > R<sub>Z</sub></em> ✓'], n: ['Direnç boyla doğru, kesitle ters orantılıdır.'] } },
    { q: { t: '12 V\'luk üretece 4 Ω ve 4 Ω\'luk ampuller seri bağlı. Ampermetre ve R<sub>1</sub>\'e bağlı voltmetre kaç değer gösterir?', o: ['1,5 A ve 6 V', '3 A ve 12 V', '1,5 A ve 12 V', '3 A ve 6 V'], f: ['k5a', 'k5b'],
      s: ['R<sub>eş</sub> = 8 Ω → I = 1,5 A', 'V<sub>1</sub> = 1,5 · 4 = <em>6 V</em> ✓'], n: ['Seri bağlı özdeş dirençler gerilimi eşit paylaşır.'] } },
    { do: S => dv(S, { mod: 'paralel', R1: 6, R2: 3 }), q: { t: '12 V\'luk üretece 6 Ω ve 3 Ω\'luk dirençler paralel bağlanıyor. Ana koldaki akım kaç A\'dir?', o: ['6', '2', '4', '1,33'], f: ['k5K'],
      s: ['R<sub>eş</sub> = 6 · 3 / 9 = 2 Ω', 'I = 12 / 2 = <em>6 A</em> ✓ (6 Ω\'dan 2 A, 3 Ω\'dan 4 A)'], n: ['Paralelde küçük dirençten büyük akım geçer.'] } },
    { q: { t: 'Aynı devrede hangi direnç daha çok ısınır (güç)?', o: ['3 Ω (24 W ve 48 W\'den 48 W)', '6 Ω', 'Eşit', 'Hiçbiri'],
      s: ['Paralelde V aynı: P = V²/R → 6 Ω: 24 W, 3 Ω: <em>48 W</em> ✓'], n: ['Seride tersi: akım aynı, P = I²R → büyük direnç daha çok ısınır.'] } },
    { do: S => dv(S, { pil: 2, ters: 1 }), q: { t: 'Her biri 12 V olan iki pilden biri ters bağlanırsa 8 Ω\'luk devreden geçen akım kaç A olur?', o: ['0', '3', '1,5', '6'], f: ['k5e'],
      s: ['Ters bağlı özdeş üreteçler birbirini götürür: ε = 0 → <em>I = 0</em> ✓'], n: ['Aynı yönde seri bağlansalardı 24 V → 3 A.'] } },
    { q: { t: 'Bir evde 2000 W ütü günde 1 saat, 100 W lamba günde 5 saat çalışıyor. 30 günde harcanan enerji kaç kWh\'tir?', o: ['75', '2,5', '60', '15'],
      s: ['Günlük: 2 kWh + 0,5 kWh = 2,5 kWh', '30 gün: <em>75 kWh</em> ✓'], n: ['kWh = kW × saat.'] } },
    { q: { t: '220 V\'luk prize bağlı 1100 W\'lık ütü ile 2200 W\'lık fırın birlikte çalışıyor. Sigortadan geçen akım kaç A\'dir?', o: ['15', '10', '5', '3300'],
      s: ['Paralel bağlı: I = P/V → 5 A + 10 A = <em>15 A</em> ✓'], n: ['Sigorta bu akımın üstündeki değerle seçilir.'] } },
    { do: S => Object.assign(S, { mod: 'mikn', it: 1, ayr: 0.6 }), q: { t: 'Çubuk mıknatıs ortasından ikiye kırılıyor. Parçalar için hangisi doğrudur?', o: ['Her parçanın N ve S kutbu olur', 'Bir parça yalnız N, diğeri yalnız S olur', 'Parçalar mıknatıslığını kaybeder', 'Kırılan uçlar nötr kalır'],
      s: ['Mıknatıs ne kadar bölünürse bölünsün her parça <em>iki kutupludur</em> ✓'], n: ['Tek kutuplu mıknatıs yoktur.'] } },
    { q: { t: 'Hangi karışım bir mıknatısla ayrıştırılabilir?', o: ['Demir tozu – kum', 'Bakır tozu – kum', 'Alüminyum – tahta', 'Tuz – şeker'],
      s: ['Mıknatıs yalnız demir, nikel, kobalt gibi ferromanyetik maddeleri çeker ✓'], n: ['Bakır ve alüminyum metal oldukları halde mıknatısa çekilmez.'] } },
  ] });
  const td = gorev(sEl, { yk: 'TYT7-g4', no: 4, tuzak: true, icon: '🪤', name: 'Tuzak sorular · elektrik ve manyetizma', task: 'Devre ve mıknatıs sorularında en sık yapılan yanlışlar.', steps: [
    { do: S => dv(S), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: 'Seri devrede akım lambalardan geçerken "harcanır" mı?', o: ['Hayır, seri devrenin her noktasında akım aynıdır', 'Evet, ilk lambadan sonra azalır', 'Evet, son lambada sıfırdır', 'Lambanın direncine göre artar'], f: ['k5a'],
      s: ['Yük korunur; seri kolda <em>akım her yerde aynı</em> ✓. Harcanan enerjidir.'], n: ['TUZAK: akımın lambalarda tükendiğini sanmak.'] } },
    { q: { t: 'Paralel bağlı lambalara yeni bir lamba daha paralel eklenirse eşdeğer direnç ne olur?', o: ['Azalır', 'Artar', 'Değişmez', 'İki katına çıkar'],
      s: ['Paralel kol eklemek akıma yeni yol açar → R<sub>eş</sub> <em>azalır</em> ✓'], n: ['TUZAK: direnç eklenince hep artar sanmak (yalnız seride artar).'] } },
    { q: { t: 'Voltmetre devreye yanlışlıkla seri bağlanırsa ne olur?', o: ['Devreden neredeyse akım geçmez', 'Lambalar daha parlak yanar', 'Ampermetre gibi çalışır', 'Sigorta atar'],
      s: ['Voltmetrenin direnci çok büyüktür → akım çok küçülür ✓'], n: ['TUZAK: ölçü aletlerinin yerini karıştırmak. Ampermetre paralel bağlanırsa kısa devre olur.'] } },
    { q: { t: '220 V için yapılmış 60 W ve 100 W lambalar seri bağlanırsa hangisi daha parlak yanar?', o: ['60 W', '100 W', 'Eşit', 'İkisi de yanmaz'],
      s: ['R = V²/P → 60 W lambanın direnci büyük', 'Seride akım aynı, P = I²R → <em>60 W</em> daha parlak ✓'], n: ['TUZAK: etiketteki gücü büyük olanın her zaman parlak yandığını sanmak.'] } },
    { do: S => Object.assign(S, { mod: 'mikn', it: 0, ayr: 0.6 }), q: { t: 'Pusula iğnesinin N ucu Dünya\'nın coğrafi kuzeyini gösterir. Buna göre Dünya\'nın coğrafi kuzeyinde hangi manyetik kutup vardır?', o: ['Manyetik güney (S) kutbu', 'Manyetik kuzey (N) kutbu', 'Kutup yoktur', 'Hem N hem S'],
      s: ['N ucu kendisini çeken zıt kutba yönelir → coğrafi kuzeyde manyetik <em>S</em> kutbu vardır ✓'], n: ['TUZAK: coğrafi ve manyetik kutupları aynı sanmak.'] } },
  ] });
  FZ.konuEk('TYT', 'Elektrik ve Manyetizma', { dersler: [hd], gorevler: [gd, td] });
})();
