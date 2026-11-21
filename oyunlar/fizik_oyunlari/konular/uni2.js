// ÜNİVERSİTE · Katıhal Fiziği: Kristal ve Bant Yapısı — SEÇMELİ · Yarı İletkenler ve p-n Eklemi — SEÇMELİ · Süperiletkenlik
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };

  // =====================================================================
  // KATIHAL — birim hücreler (SC, BCC, FCC) ve enerji bantları
  // =====================================================================
  const TUR = ['', 'Basit kübik (SC)', 'Hacim merkezli kübik (BCC)', 'Yüzey merkezli kübik (FCC)'];
  const sKH = sahne({ icon: '💎', cam: [[1.6, 4.5, 10], [1.6, 2, 0]], plate: [10, 6, 0, 0],
    data: [['Birim hücre', 'kristalin tekrar eden en küçük parçası']],
    S0: () => ({ mod: 'kristal', tur: 1, don: 0, T: 300 }),
    kur(g) {
      const kr = new THREE.Group(); kr.position.set(0, 2.2, 0); g.add(kr); const a = 2.4, h = a / 2;
      const kenar = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(a, a, a)), new THREE.LineBasicMaterial({ color: 0x334155 })); kr.add(kenar);
      const kose = [], ic = [], yuz = [];
      for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) kose.push(top(kr, 0.28, 0x3b82f6, x, y, z));
      ic.push(top(kr, 0.28, 0xef4444, 0, 0, 0));
      [[h, 0, 0], [-h, 0, 0], [0, h, 0], [0, -h, 0], [0, 0, h], [0, 0, -h]].forEach(p => yuz.push(top(kr, 0.28, 0x22c55e, ...p)));
      const bant = new THREE.Group(); g.add(bant); const sut = [];
      [['Metal', 0, -3], ['Yarı iletken', 1.1, 0], ['Yalıtkan', 5.5, 3]].forEach(([ad, Eg, x]) => {
        const s = 0.35, alt = kutu(bant, 1.8, 1.2, 0.3, 0x1d4ed8, x, 0.9, 0), ust = kutu(bant, 1.8, 1.2, 0.3, 0x94a3b8, x, 0.9 + 1.2 + (Eg ? Eg * s : -0.4), 0, { op: 0.6 });
        const el = []; for (let i = 0; i < 6; i++) el.push(top(bant, 0.08, 0xfacc15, x - 0.7 + i * 0.28, 0, 0.2, { edge: false }));
        sut.push({ ad, Eg, x, alt, ust, el }); kart('kh' + x, '', '#475569'); });
      kart('kht', '', '#F5C400');
      return { kr, kose, ic, yuz, bant, sut };
    },
    tick(S, dt, o) {
      const k = S.mod === 'kristal'; o.kr.visible = k; o.bant.visible = !k;
      if (k) { S.don += dt * 0.4; o.kr.rotation.set(0.35, S.don, 0); o.ic.forEach(m => m.visible = S.tur === 2); o.yuz.forEach(m => m.visible = S.tur === 3);
        const n = [0, 1, 2, 4][S.tur]; FZ.setTag('kht', `${TUR[S.tur]}<br>atom/hücre: ${S.tur === 1 ? '8 · ⅛ = 1' : S.tur === 2 ? '8 · ⅛ + 1 = 2' : '8 · ⅛ + 6 · ½ = 4'}`); FZ.show('kht', V3(0, 4.6, 0), 1); }
      else {
        o.sut.forEach((c, i) => { const s = 0.35, yu = 0.9 + 1.2 + (c.Eg ? c.Eg * s : -0.4);
          c.el.forEach((m, j) => { const ust = c.Eg === 0 ? j < 3 : (c.Eg < 2 && j === 0); /* yarı iletkende ısıyla birkaç elektron iletim bandına çıkar */ const yy = ust ? yu - 0.4 + 0.15 * Math.sin(S.t * 3 + j) : 1.2 + 0.15 * Math.sin(S.t * 2 + j);
            m.position.y = yy; });
          FZ.setTag('kh' + c.x, `${c.ad}<br>E<sub>g</sub> ${c.Eg ? '= ' + fs(c.Eg) + ' eV' : 'yok (bantlar örtüşür)'}`); FZ.show('kh' + c.x, V3(c.x, 4.4, 0), 1); });
        FZ.setTag('kht', 'Mavi: değerlik bandı (dolu) · gri: iletim bandı · sarı: elektron'); FZ.show('kht', V3(0, 5.3, 0), 1); }
    },
    qp: () => V3(0, 5.6, 0) });
  const dKH = ders(sKH, { yk: 'UNI10-d1', no: 1, icon: '💎', name: 'Elmas ve grafit: aynı atom, farklı katı', task: 'Kristal yapı, birim hücre (SC, BCC, FCC), Bragg kırınımı, enerji bantları; metal, yarı iletken, yalıtkan.', steps: [
    { k: { tur: 'merak', b: 'Elmas yalıtkan, grafit (kurşun kalem ucu) iletken. İkisi de saf karbon!', m: ['Fark atomların diziliş biçiminde ve bunun elektronlara izin verdiği enerjilerde.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Birim hücre', m: ['Kristal, birim hücrenin üç boyutta tekrarıdır.', 'Köşedeki atom 8 hücrede ortak (⅛), yüzeydeki 2 hücrede (½), içteki yalnız o hücrede (1).'] } },
    { p: { t: 'Yüzey merkezli kübik (FCC) birim hücreye kaç atom düşer?', o: ['14', '4', '2', '8'], d: 1 } },
    { sub: 'Yüzey merkezli kübik hücreyi kuralım.', go: '▶︎ Kur' },
    { do: S => { S.tur = 3; }, sub: 'Yeşiller yüzey merkezleri.', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Paylaşılan atomlar kesirli sayılır', f: ['kht'], m: ['8 köşe · ⅛ + 6 yüz · ½ = 1 + 3 = <em>4 atom</em>. (Bakır, alüminyum, altın FCC\'dir.)'] } },
    { x: { b: 'Kristal türünü değiştir', m: ['1: basit kübik · 2: hacim merkezli · 3: yüzey merkezli'],
      kay: [{ ad: 'tur', etiket: 'Tür', min: 1, max: 3, adim: 1, deger: 3, birim: '', set: (S, v) => { S.tur = v; } }],
      olc: S => `${TUR[S._tur]}: <em>${[0, 1, 2, 4][S._tur]} atom/hücre</em>` } },
    { k: { tur: 'kavram', b: 'Kristali nasıl "görürüz"? Bragg', m: [`Atom düzlemlerinden yansıyan X ışınları girişim yapar: ${FM('2 d sin θ = n λ')}`, 'd: düzlemler arası uzaklık (~0,1–0,5 nm). Bu yüzden X ışını (λ ~ 0,1 nm) kullanılır.'] } },
    { do: S => { S.mod = 'bant'; }, k: { tur: 'kavram', b: 'Enerji bantları', m: ['Tek atomda keskin enerji seviyeleri vardır. Milyarlarca atom yaklaşınca seviyeler <em>bantlara</em> yayılır.', 'Dolu en üst bant: değerlik bandı. Üstündeki: iletim bandı. Aradaki yasak bölge: E<sub>g</sub>.'] } },
    { p: { t: 'Oda sıcaklığında (kT ≈ 0,025 eV) yasak bandı 5,5 eV olan elmasın iletim bandında elektron bulunur mu?', o: ['Bolca bulunur', 'Neredeyse hiç bulunmaz', 'Tam yarısı oradadır', 'Elektronlar bantlar arasında durur'], d: 1 } },
    { sub: 'Üç katıyı karşılaştıralım.', go: '▶︎ Karşılaştır' },
    { k: { tur: 'gozlem', sonuc: true, b: 'İletkenliği E<sub>g</sub> belirler', m: ['Metal: bantlar örtüşür, elektronlar hemen hareket eder.', 'Yarı iletken (Si, 1,1 eV): ısıyla az sayıda elektron iletim bandına çıkar. Yalıtkan (elmas, 5,5 eV): neredeyse hiç.'] } },
    { k: { tur: 'dikkat', b: 'Sıcaklığın ters etkisi', m: ['Metal ısınınca titreşen atomlar elektronları saçar → direnç <em>artar</em>.', 'Yarı iletken ısınınca iletim bandına daha çok elektron çıkar → direnç <em>azalır</em>.', 'Bantlar arasında elektron "durmaz"; yasak bölgede izinli durum yoktur.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`SC: 1 · BCC: 2 · FCC: 4 atom/hücre · ${FM('2 d sin θ = n λ')} · E<sub>g</sub>: metal yok, yarı iletken ~1 eV, yalıtkan > 4 eV`] } },
  ] });
  const gKH = gorev(sKH, { yk: 'UNI10-g1', no: 1, icon: '🔷', name: 'Kristal laboratuvarı', task: 'Birim hücre, Bragg yasası ve bant yapısı soruları.', steps: [
    { do: S => { S.mod = 'kristal'; S.tur = 2; }, sub: 'Kristal yapıyı inceliyoruz.', go: '▶︎ Başlat' },
    { q: { t: 'Hacim merkezli kübik (BCC) birim hücreye kaç atom düşer?', o: ['2', '9', '1', '4'], f: ['kht'],
      s: ['8 köşe · ⅛ = 1', '+ merkezdeki 1 atom → <em>2 atom</em> ✓'], n: ['Demir (oda sıcaklığında) BCC yapıdadır.'] } },
    { do: S => { S.tur = 3; }, q: { t: 'Yüzey merkezli kübik (FCC) birim hücreye kaç atom düşer?', o: ['4', '14', '6', '2'], f: ['kht'],
      s: ['8 köşe · ⅛ + 6 yüz · ½', '= 1 + 3 = <em>4 atom</em> ✓'], n: ['Köşe ve yüzey atomlarını tam sayarsanız 14 bulursunuz; bu sık yapılan hatadır.'] } },
    { q: { t: 'Düzlemler arası uzaklığı 0,2 nm olan kristalde birinci dereceden (n = 1) yansıma θ = 30°\'de gözleniyor. X ışınının dalga boyu kaç nm\'dir?', o: ['0,2 nm', '0,1 nm', '0,4 nm', '0,35 nm'],
      s: [`${FM('2 d sin θ = n λ')} → λ = 2 · 0,2 · sin 30°`, '= 2 · 0,2 · 0,5 = <em>0,2 nm</em> ✓'], n: ['θ, gelen ışının atom düzlemiyle yaptığı açıdır (normalle değil).'] } },
    { do: S => { S.mod = 'bant'; }, q: { t: 'Aşağıdakilerden hangisi oda sıcaklığında yarı iletkendir?', o: ['Silisyum (E<sub>g</sub> = 1,1 eV)', 'Elmas (E<sub>g</sub> = 5,5 eV)', 'Bakır (bant aralığı yok)', 'Kuvars (E<sub>g</sub> ≈ 9 eV)'],
      s: ['Yarı iletkenlerde E<sub>g</sub> yaklaşık 0,5–3 eV arasındadır.', '<em>Silisyum</em> ✓'], n: ['Bakır metal, elmas ve kuvars yalıtkandır.'] } },
  ] });
  konuEkle('UNI', 'Katıhal Fiziği: Kristal ve Bant Yapısı', { dersler: [dKH], gorevler: [gKH] });

  // =====================================================================
  // SEÇMELİ · YARI İLETKENLER VE p-n EKLEMİ — diyot, öngerilim, I–V eğrisi
  // =====================================================================
  const I0 = 1e-12, VT = 0.025;
  const akim = V => I0 * (Math.exp(V / VT) - 1);
  const sPN = sahne({ icon: '🔌', cam: [[1.8, 4, 10.5], [1.8, 1.8, 0]], plate: [11, 5, 0, 0],
    data: [['Malzeme', 'silisyum diyot'], ['Doyum akımı', 'I₀ = 10⁻¹² A']],
    S0: () => ({ V: 0, ph: 0 }),
    kur(g) {
      const p = kutu(g, 3, 1.6, 1.2, 0xfca5a5, -1.5, 1.2, 0, { op: 0.6 }), n = kutu(g, 3, 1.6, 1.2, 0x93c5fd, 1.5, 1.2, 0, { op: 0.6 });
      const tuk = kutu(g, 1, 1.62, 1.22, 0xe5e7eb, 0, 1.2, 0, { op: 0.8 });
      const hol = [], el = []; for (let i = 0; i < 14; i++) { hol.push(top(g, 0.1, 0xffffff, 0, 0, 0)); el.push(top(g, 0.1, 0x1d4ed8, 0, 0, 0)); }
      const rnd = Array.from({ length: 14 }, () => [Math.random(), Math.random(), Math.random()]);
      const egri = duz(g, 0x111827), eks = duz(g, 0x94a3b8), nok = top(g, 0.1, 0xdc2626, 0, 0, 0);
      kart('pnp', 'p-tipi (hol)', '#dc2626'); kart('pnn', 'n-tipi (elektron)', '#2563eb'); kart('pnt', '', '#F5C400'); etiket('pnd', 'tükenim', '#475569');
      return { p, n, tuk, hol, el, rnd, egri, eks, nok };
    },
    tick(S, dt, o) {
      const gen = Math.max(0.15, 1 * Math.sqrt(Math.max(0.05, 0.7 - S.V) / 0.7)); o.tuk.scale.x = gen;
      const I = akim(S.V), hiz = Math.min(1.2, Math.max(0, I / 0.02)); S.ph += dt * hiz;
      o.hol.forEach((m, i) => { const r = o.rnd[i]; let x = -3 + ((r[0] * 3 + S.ph) % 3); if (hiz < 0.01) x = -3 + r[0] * (3 - gen / 2);
        m.position.set(x, 0.6 + r[1] * 1.2, -0.5 + r[2]); m.visible = hiz > 0.01 || x < -gen / 2; });
      o.el.forEach((m, i) => { const r = o.rnd[(i + 5) % 14]; let x = 3 - ((r[0] * 3 + S.ph) % 3); if (hiz < 0.01) x = gen / 2 + r[0] * (3 - gen / 2);
        m.position.set(x, 0.6 + r[2] * 1.2, -0.5 + r[1]); m.visible = hiz > 0.01 || x > gen / 2; });
      // I–V grafiği (sağ üst köşede): V ∈ [−1, 0,8], I ∈ [0, 30 mA]
      const gx = V => 1.9 + V * 1.6, gy = I => 2.5 + Math.min(1.5, I / 0.03 * 1.5), pts = [];
      for (let i = 0; i <= 90; i++) { const V = -1 + i / 90 * 1.8; pts.push(V3(gx(V), gy(Math.max(akim(V), -0.001)), 0)); }
      FZ.setLine(o.egri, pts); FZ.setLine(o.eks, [V3(gx(-1), 2.5, 0), V3(gx(0.8), 2.5, 0), V3(gx(0), 2.5, 0), V3(gx(0), 4.1, 0)]);
      o.nok.position.set(gx(S.V), gy(Math.max(I, 0)), 0);
      FZ.show('pnp', V3(-1.5, 1.7, 0.7), 1); FZ.show('pnn', V3(1.5, 1.7, 0.7), 1); FZ.show('pnd', V3(0, 0.15, 0.7), 1);
      const Is = Math.abs(I) < 1e-9 ? `${(I * 1e12).toFixed(1).replace('.', ',')} pA` : Math.abs(I) < 1e-3 ? `${fs(I * 1e6)} μA` : `${fs(I * 1e3)} mA`;
      FZ.setTag('pnt', `V = ${fs(S.V)} V (${S.V > 0 ? 'ileri' : S.V < 0 ? 'ters' : 'yok'}) · I = ${Is}`); FZ.show('pnt', V3(-0.9, 2.3, 0), 1);
    },
    qp: () => V3(0, 4, 0) });
  const dPN = ders(sPN, { yk: 'SEC1-d1', no: 1, icon: '💡', name: 'Akımı tek yöne geçiren kapı', task: 'Katkılama (n ve p tipi), p-n eklemi, tükenim bölgesi, ileri/ters öngerilim, diyot denklemi.', steps: [
    { k: { tur: 'merak', b: 'Telefon şarj aleti prizdeki AC\'yi nasıl DC\'ye çevirir?', m: ['Akımı yalnız bir yönde geçiren diyotlarla. Diyot, iki farklı katkılanmış silisyumun birleşimidir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Katkılama', m: ['Si 4 değerliklidir. 5 değerlikli fosfor eklenince fazla bir elektron kalır → <em>n-tipi</em> (çoğunluk taşıyıcı: elektron).', '3 değerlikli bor eklenince bir elektron eksik kalır (hol) → <em>p-tipi</em> (çoğunluk taşıyıcı: hol).'] } },
    { k: { tur: 'kavram', b: 'p-n eklemi', f: ['pnd'], m: ['Birleşimde elektronlar ve holler karşılaşıp yok olur: ortada taşıyıcısız <em>tükenim bölgesi</em> ve bir iç elektrik alan oluşur.', 'Bu alan, taşıyıcıların geçişini engelleyen ~0,7 V\'luk bir engel gibi davranır (Si).'] } },
    { p: { t: 'p tarafı pilin + ucuna bağlanırsa (ileri öngerilim) ne olur?', o: ['Tükenim bölgesi genişler, akım durur', 'Tükenim bölgesi daralır, akım geçer', 'Hiçbir şey değişmez', 'Diyot bozulur'], d: 1 } },
    { sub: '0,65 V ileri öngerilim uygulayalım.', go: '▶︎ Uygula' },
    { do: S => { S.V = 0.65; }, sub: 'Taşıyıcılar eklemi geçiyor.', wait: 3 },
    { k: { tur: 'gozlem', sonuc: true, b: 'İleri yönde akım üstel artar', f: ['pnt', 'pnd'], m: [`${FM(`I = I<sub>0</sub> (e<sup>${F('V', 'V<sub>T</sub>')}</sup> − 1)`)} · V<sub>T</sub> = ${F('kT', 'e')} ≈ 25 mV (oda sıcaklığı)`] } },
    { do: S => { S.V = -0.8; }, sub: 'Şimdi ters öngerilim: −0,8 V.', wait: 3 },
    { k: { tur: 'kavram', b: 'Ters öngerilim', f: ['pnt', 'pnd'], m: ['Tükenim bölgesi genişler; yalnız çok küçük bir doyum akımı (−I₀ ≈ pikoamper) geçer.', 'Diyot böylece akımı tek yönde geçirir: doğrultucu.'] } },
    { x: { b: 'Gerilimi değiştir', m: ['Grafikteki kırmızı nokta çalışma noktasıdır.'],
      kay: [{ ad: 'V', etiket: 'V', min: -1, max: 0.75, adim: 0.05, deger: 0.6, birim: 'V', set: (S, v) => { S.V = v; } }],
      olc: S => { const I = akim(S._V); return `I = <em>${Math.abs(I) < 1e-6 ? (I * 1e12).toFixed(1).replace('.', ',') + ' pA' : fs(I * 1e3) + ' mA'}</em><br>Her +58 mV\'ta akım yaklaşık 10 katına çıkar.`; } } },
    { do: S => { S.V = 0.6; }, k: { tur: 'dikkat', b: 'Hol gerçek bir parçacık değil', m: ['Hol, değerlik bandında elektronun <em>eksik</em> olduğu yerdir; pozitif yüklü parçacık gibi davranır.', 'LED\'de ileri yönde birleşen elektron-hol çiftleri foton yayar; güneş pilinde ise foton çift oluşturur, iç alan onları ayırır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`n-tipi: 5 değerlikli katkı · p-tipi: 3 değerlikli katkı · ${FM(`I = I<sub>0</sub> (e<sup>V/V<sub>T</sub></sup> − 1)`)} · ileri: akım geçer, ters: ≈ 0`] } },
  ] });
  const gPN = gorev(sPN, { yk: 'SEC1-g1', no: 1, icon: '🔋', name: 'Diyot devresi', task: 'Katkılama türü, öngerilim, diyotlu devre akımı ve güneş pili soruları.', steps: [
    { do: S => { S.V = 0; }, sub: 'Silisyum p-n eklemi hazır.', go: '▶︎ Başlat' },
    { q: { t: 'Saf silisyuma az miktarda fosfor (5 değerlikli) katılırsa ne tür yarı iletken elde edilir?', o: ['n-tipi, çoğunluk taşıyıcı elektron', 'p-tipi, çoğunluk taşıyıcı hol', 'Yalıtkan', 'Süperiletken'], f: ['pnn'],
      s: ['Fosforun 5. elektronu bağa katılmaz, serbest kalır.', '<em>n-tipi</em> (negatif taşıyıcı) ✓'], n: ['Katkılanmış yarı iletken yine nötrdür; yalnız serbest taşıyıcı türü değişir.'] } },
    { do: S => { S.V = -0.8; }, q: { t: 'Diyota ters öngerilim uygulanırsa devreden geçen akım için ne söylenebilir?', o: ['Çok küçük bir doyum akımı geçer', 'Akım üstel olarak artar', 'Akım ileri yöndekiyle aynıdır', 'Diyot iletken olur'], f: ['pnt', 'pnd'],
      s: ['Tükenim bölgesi genişler; yalnız azınlık taşıyıcılardan gelen I₀ geçer.', '<em>Çok küçük</em> (pA mertebesinde) ✓'], n: ['Çok büyük ters gerilimde "kırılma" olur; Zener diyotları bunu kullanır.'] } },
    { do: S => { S.V = 0.7; }, q: { t: '5 V\'luk pil, ileri yönde bağlı bir Si diyot (üzerinde 0,7 V düşer) ve 430 Ω\'luk direnç seri bağlanıyor. Akım kaç mA\'dir?', o: ['10 mA', '11,6 mA', '1,6 mA', '100 mA'],
      s: ['Dirence kalan gerilim: 5 − 0,7 = 4,3 V', `I = ${F('4,3', '430')} = 0,01 A = <em>10 mA</em> ✓`], n: ['Diyotu ideal sayıp 0,7 V\'u unutursanız 11,6 mA bulursunuz.'] } },
    { q: { t: 'Güneş pilinde ışığın oluşturduğu elektron-hol çiftlerini birbirinden ayıran nedir?', o: ['Tükenim bölgesindeki iç elektrik alan', 'Pilin dış devresindeki direnç', 'Işığın basıncı', 'Manyetik alan'],
      s: ['İç alan elektronları n tarafına, holleri p tarafına sürükler.', 'Böylece dışarıya akım verilir: <em>iç elektrik alan</em> ✓'], n: ['Güneş pili, ışıkla çalışan ve dışarı enerji veren bir p-n eklemidir (LED\'in tersi).'] } },
  ] });
  konuEkle('SEC', 'Yarı İletkenler ve p-n Eklemi', { dersler: [dPN], gorevler: [gPN] });

  // =====================================================================
  // SEÇMELİ · SÜPERİLETKENLİK — YBCO disk üzerinde mıknatıs (Meissner olayı), T_c = 92 K
  // =====================================================================
  const TC = 92;
  const sSU = sahne({ icon: '🧊', cam: [[1.4, 3.5, 9], [1.4, 1.5, 0]], plate: [9, 5, 0, 0],
    data: [['Süperiletken', 'YBCO, T<sub>c</sub> = 92 K'], ['Mıknatıs', 'm = 0,05 kg'], ['g', '10 m/s²']],
    S0: () => ({ T: 300, hedef: 300, y: 0 }),
    kur(g) {
      silindir(g, 1.4, 1.4, 0.3, 0x1f2937, 0, 0.15, 0); const disk = silindir(g, 1.1, 1.1, 0.12, 0x475569, 0, 0.36, 0);
      const mik = new THREE.Group(); g.add(mik); kutu(mik, 0.7, 0.18, 0.7, 0xef4444, 0, 0.09, 0); kutu(mik, 0.7, 0.18, 0.7, 0x3b82f6, 0, 0.27, 0);
      const sis = FZ.mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.4, 32), 0xe0f2fe, { op: 0.5, edge: false, cast: false }); sis.position.y = 0.5; g.add(sis);
      const egri = duz(g, 0x111827), eks = duz(g, 0x94a3b8), nok = top(g, 0.08, 0xdc2626, 0, 0, 0);
      etiket('suG', 'mg', '#7c3aed'); etiket('suF', 'F<sub>m</sub>', '#dc2626'); etiket('suN', 'N', '#0891b2'); kart('sut', '', '#F5C400');
      return { disk, mik, sis, egri, eks, nok, oG: ok(0x8b5cf6, 'suG'), oF: ok(0xef4444, 'suF'), oN: ok(0x06b6d4, 'suN') };
    },
    tick(S, dt, o) {
      S.T += (S.hedef - S.T) * Math.min(1, dt * 0.8); const sup = S.T < TC;
      S.y += ((sup ? 0.6 : 0) - S.y) * Math.min(1, dt * 2.5); o.mik.position.y = 0.42 + S.y; o.sis.visible = S.T < 150;
      o.disk.material.color.setHex(sup ? 0x334155 : 0x64748b);
      const c = o.mik.position.clone().add(V3(0, 0.18, 0)), L = 1; // mg = 0,5 N → 1 birim; ağırlık mıknatısın merkezinden
      FZ.setArrow(o.oG, c.clone().add(V3(-0.15, 0, 0.45)), V3(0, -1, 0), L); FZ.show('suG', c.clone().add(V3(-0.5, -L - 0.2, 0.45)), 1);
      const yuz = o.mik.position.clone().add(V3(0.15, 0, 0.45)); // alt yüzey: manyetik itme / tepki buradan
      if (S.y > 0.05) { const Fm = S.y / 0.6; FZ.setArrow(o.oF, yuz, V3(0, 1, 0), L * Fm); FZ.show('suF', yuz.clone().add(V3(0.45, L * Fm, 0)), 1); }
      if (S.y < 0.55) { const N = 1 - S.y / 0.6; if (N > 0.05) { FZ.setArrow(o.oN, yuz.clone().add(V3(0.15, 0, 0)), V3(0, 1, 0), L * N); FZ.show('suN', yuz.clone().add(V3(0.6, L * N, 0)), 1); } }
      // R–T grafiği
      const gx = T => 1.4 + T / 300 * 2, gy = T => 1.6 + (T < TC ? 0 : 0.3 + (T - TC) / 208 * 1.2), pts = [];
      for (let i = 0; i <= 100; i++) { const T = i / 100 * 300; pts.push(V3(gx(T), gy(T), 0)); }
      FZ.setLine(o.egri, pts); FZ.setLine(o.eks, [V3(gx(0), 3.3, 0), V3(gx(0), 1.6, 0), V3(gx(300), 1.6, 0)]); o.nok.position.set(gx(S.T), gy(S.T), 0);
      FZ.setTag('sut', `T = ${Math.round(S.T)} K · ${sup ? 'süperiletken: R = 0' : 'normal: R > 0'}`); FZ.show('sut', V3(1.1, 3.6, 0), 1);
    },
    qp: () => V3(0, 3.6, 0) });
  const dSU = ders(sSU, { yk: 'SEC2-d1', no: 1, icon: '🚄', name: 'Havada süzülen tren', task: 'Kritik sıcaklık, sıfır direnç, Meissner olayı, Cooper çiftleri, MR ve maglev.', steps: [
    { k: { tur: 'merak', b: 'Japonya\'daki maglev treni raylara değmeden 600 km/h\'e çıkıyor', m: ['Sırrı, çok soğutulunca elektriğe hiç direnç göstermeyen ve mıknatısları iten malzemeler: süperiletkenler.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Sıfır direnç', m: ['1911\'de Kamerlingh Onnes cıvanın direncinin 4,2 K\'de birden <em>tam sıfıra</em> düştüğünü buldu.', 'Bu sıcaklığa kritik sıcaklık T<sub>c</sub> denir. YBCO seramiğinde T<sub>c</sub> = 92 K: sıvı azotla (77 K) soğutulabilir.'] } },
    { p: { t: 'Mıknatıs disk üzerinde duruyor. Disk sıvı azotla 77 K\'e soğutulursa mıknatısa ne olur?', o: ['Diske yapışır', 'Diskin üstünde havada asılı kalır', 'Hiçbir şey olmaz', 'Mıknatıslığını kaybeder'], d: 1 } },
    { sub: 'Sıvı azotu dökelim.', go: '▶︎ Soğut' },
    { do: S => { S.hedef = 77; }, sub: 'Sıcaklık düşüyor…', until: S => S.T < 80 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Meissner olayı', f: ['suF', 'suG', 'sut'], m: ['Süperiletken içindeki manyetik alanı dışarı iter (mükemmel diyamanyetik). Mıknatısa yukarı manyetik kuvvet etki eder.', `Mıknatıs dengede: ${FM('F<sub>m</sub> = m g')} = 0,05 · 10 = 0,5 N. Oklar eşit boyda.`] } },
    { k: { tur: 'kavram', b: 'Neden direnç sıfır? (BCS)', m: ['T<sub>c</sub> altında elektronlar örgü titreşimleri aracılığıyla <em>Cooper çiftleri</em> oluşturur.', 'Çiftler tek bir kuantum durumunda topluca hareket eder; örgü onları saçamaz → enerji kaybı yok.'] } },
    { x: { b: 'Sıcaklığı değiştir', m: ['Grafikteki kırmızı nokta: direnç–sıcaklık.'],
      kay: [{ ad: 'T', etiket: 'T', min: 60, max: 140, adim: 10, deger: 80, birim: 'K', set: (S, v) => { S.hedef = v; } }],
      olc: S => S._T < TC ? `T = ${S._T} K < T<sub>c</sub> → <em>süperiletken</em>, mıknatıs asılı` : `T = ${S._T} K > T<sub>c</sub> → <em>normal</em>, mıknatıs diskin üstünde (N = mg)` } },
    { do: S => { S.hedef = 77; }, k: { tur: 'dikkat', b: 'Havada asılı ama kuvvetsiz değil', m: ['Sık yanlış: "Süperiletken yer çekimini yok eder."', 'Ağırlık hâlâ vardır (mg aşağı); onu süperiletkenin uyguladığı manyetik itme kuvveti dengeler. Isınınca bu kuvvet kaybolur ve disk N ile taşır.', 'Çok güçlü manyetik alan da süperiletkenliği bozar (kritik alan).'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['T < T<sub>c</sub>: R = 0 ve manyetik alan dışlanır (Meissner).', 'Uygulamalar: MR mıknatısları, maglev, parçacık hızlandırıcılar, kayıpsız kablolar, kuantum bilgisayar kübitleri.'] } },
  ] });
  const gSU = gorev(sSU, { yk: 'SEC2-g1', no: 1, icon: '🧲', name: 'Süzülen mıknatıs', task: 'Kritik sıcaklık, sıfır direnç, Meissner ve kuvvet dengesi soruları.', data: [['Süperiletken', 'YBCO, T<sub>c</sub> = 92 K'], ['Mıknatıs', 'm = 0,05 kg'], ['g', '10 m/s²']], steps: [
    { do: S => { S.hedef = 77; }, sub: 'Disk sıvı azotla soğutuluyor.', go: '▶︎ Başlat' },
    { q: { t: 'Kritik sıcaklığı 92 K olan YBCO, sıvı azotun kaynama noktasında (77 K) hangi durumdadır?', o: ['Süperiletken', 'Normal iletken', 'Yalıtkan', 'Erimiş'], f: ['sut'],
      s: ['77 K < 92 K = T<sub>c</sub>', '→ <em>süperiletken</em> ✓'], n: ['Ucuz sıvı azotla çalışabilmesi yüksek sıcaklık süperiletkenlerini önemli kılar.'] } },
    { q: { t: '0,05 kg\'lık mıknatıs süperiletken üzerinde hareketsiz asılı duruyor. Mıknatısa etki eden manyetik kuvvet kaç N\'dur?', o: ['0,5 N', '0', '0,05 N', '5 N'], f: ['suF', 'suG'],
      s: ['Mıknatıs dengede → ΣF = 0', `F<sub>m</sub> = m g = 0,05 · 10 = <em>0,5 N</em> ✓ (yukarı)`], n: ['Asılı kalmak kuvvetsizlik değil, kuvvetlerin dengesidir.'] } },
    { q: { t: 'Süperiletken bir halkada başlatılan akım, halka T<sub>c</sub>\'nin altında tutulursa ne olur?', o: ['Yıllarca azalmadan sürer', 'Hemen söner', 'Birkaç saniyede yarıya iner', 'Halka ısınır'],
      s: ['R = 0 → I²R ısı kaybı yok.', 'Akım <em>azalmadan sürer</em> ✓ (deneylerde yıllarca ölçülebilir azalma görülmedi)'], n: ['MR mıknatısları bu yüzden bir kez "doldurulunca" kendi kendine çalışır.'] } },
    { do: S => { S.hedef = 120; }, q: { t: 'Disk ısınıp T<sub>c</sub>\'yi geçince mıknatısa etki eden kuvvetler için hangisi doğrudur?', o: ['Manyetik itme kaybolur, diskin tepki kuvveti (N) ağırlığı dengeler', 'Mıknatıs havada kalmaya devam eder', 'Ağırlık sıfır olur', 'Mıknatıs yukarı fırlar'], f: ['suN', 'suG'],
      s: ['Meissner olayı biter → F<sub>m</sub> ≈ 0', 'Mıknatıs diske oturur: <em>N = mg</em> ✓ (N yüzeyden mıknatısa, yukarı)'], n: ['N, yüzeye dik ve yüzeyden cisme doğrudur.'] } },
  ] });
  konuEkle('SEC', 'Süperiletkenlik', { dersler: [dSU], gorevler: [gSU] });
})();
