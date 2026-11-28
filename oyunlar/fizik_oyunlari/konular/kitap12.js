// Kitap soru bankası · TYT (3): GRAFİK SORULARI ve kalan soru tipleri
// Grafik tahtası: x–t, v–t, a–t, m–V, F–a, F–x, T–Q, P–V grafikleri hesaplanarak çizilir; hareket grafiklerinde altındaki araba
// grafiğe göre hareket eder (cevaptan sonra). Ayrıca elektroskop durumları, lamba devreleri, pusula–Dünya manyetik alanı, ısı yalıtımı.
// Benim Hocam TYT kitap taramasındaki SORU TİPLERİ örnek alınmıştır; sorular, sayılar ve durumlar özgündür.
(function () {
  const { V3, sahne, gorev, kutu, THREE } = FZ, SH = FZ.SAHNE || {};
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const RENK = [0xfacc15, 0x22d3ee, 0xf472b6], RENKC = ['#facc15', '#22d3ee', '#f472b6'];
  const X0 = -3.1, GW = 6.2, Y0 = 1.1, GH = 2.7;

  // ---------------- GRAFİK TAHTASI ----------------
  const sGr = sahne({ icon: '📈', cam: [[1.1, 2.7, 14.5], [1.1, 2.4, 0]], plate: [14, 6, 0, 0], data: [],
    S0: () => ({ eg: [], tur: 'v', tmax: 8, ymin: 0, ymax: 20, xEt: 't (s)', yEt: 'v (m/s)', tA: 2, yA: 5, etk: [], tt: 0, kos: 0, araba: 1, v0: 0, olc: 0.1 }),
    kur(g) {
      const T = {};
      kutu(g, 8.0, 4.1, 0.08, 0x0f172a, 0.1, 2.5, -1.2, { edge: false });
      const cizgi = (renk, op = 1) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(), V3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: renk, transparent: op < 1, opacity: op })); l.visible = false; g.add(l); return l; };
      T.ex = cizgi(0xffffff); T.ey = cizgi(0xffffff); T.sifir = cizgi(0x94a3b8, 0.7); T.izgara = []; for (let i = 0; i < 24; i++) T.izgara.push(cizgi(0x334155, 0.9));
      T.egri = RENK.map(r => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(), V3(1, 0, 0)]), 2, 0.035, 6), new THREE.MeshBasicMaterial({ color: r })); m.visible = false; g.add(m); return m; });
      T.nokta = RENK.map(r => { const m = FZ.top(g, 0.09, r, 0, 0, 0, { edge: false }); m.material.emissive = new THREE.Color(r); m.material.emissiveIntensity = 0.6; m.visible = false; return m; });
      T.yol = kutu(g, 13, 0.04, 1.4, 0x475569, 0, 0.02, 1.6, { edge: false });
      T.araba = [FZ.araba(g, 0xef4444), FZ.araba(g, 0x2563eb)]; T.araba.forEach(a => { a.scale.setScalar(0.7); a.visible = false; });
      T.et = []; for (let i = 0; i < 26; i++) { FZ.etiket('gr' + i, '', '#1e293b'); T.et.push('gr' + i); }
      FZ.etiket('grX', '', '#334155'); FZ.etiket('grY', '', '#334155'); ['grA', 'grB', 'grC'].forEach((id, i) => FZ.etiket(id, '', ['#a16207', '#0e7490', '#be185d'][i]));
      return T;
    },
    tick(S, dt, T) {
      const X = t => X0 + t / S.tmax * GW, Y = v => Y0 + (v - S.ymin) / (S.ymax - S.ymin) * GH, Z = -1.1;
      FZ.setLine(T.ex, [V3(X0, Y(Math.max(S.ymin, 0)), Z), V3(X0 + GW + 0.3, Y(Math.max(S.ymin, 0)), Z)]); FZ.setLine(T.ey, [V3(X0, Y0, Z), V3(X0, Y0 + GH + 0.3, Z)]);
      T.sifir.visible = false; if (S.ymin < 0) FZ.setLine(T.sifir, [V3(X0, Y(0), Z), V3(X0 + GW, Y(0), Z)]);
      let n = 0; const etk = (txt, p, dx = 0, dy = 0) => { if (n >= T.et.length) return; const id = T.et[n++]; FZ.setTag(id, txt); FZ.show(id, p, 1, dx, dy); };
      let iz = 0; T.izgara.forEach(l => l.visible = false);
      for (let t = S.tA; t <= S.tmax + 1e-6; t += S.tA) { if (iz < T.izgara.length) FZ.setLine(T.izgara[iz++], [V3(X(t), Y0, Z - 0.01), V3(X(t), Y0 + GH, Z - 0.01)]); etk(fs(t), V3(X(t), Y(Math.max(S.ymin, 0)) - 0.25, Z), 0, 6); }
      for (let v = Math.ceil(S.ymin / S.yA) * S.yA; v <= S.ymax + 1e-6; v += S.yA) { if (Math.abs(v) < 1e-9) continue; if (iz < T.izgara.length) FZ.setLine(T.izgara[iz++], [V3(X0, Y(v), Z - 0.01), V3(X0 + GW, Y(v), Z - 0.01)]); etk(fs(v), V3(X0 - 0.3, Y(v), Z), -10, 0); }
      etk('0', V3(X0 - 0.22, Y(Math.max(S.ymin, 0)) - 0.22, Z), 0, 0);   // başlangıç noktası
      FZ.setTag('grX', S.xEt); FZ.show('grX', V3(X0 + GW + 0.55, Y(Math.max(S.ymin, 0)), Z), 1); FZ.setTag('grY', S.yEt); FZ.show('grY', V3(X0, Y0 + GH + 0.5, Z), 1);
      (S.etk || []).forEach(([t, v, txt]) => etk(txt, V3(X(t), Y(v), Z), 0, -16));
      if (S.kos) { S.tt = Math.min(S.tmax, S.tt + dt * S.tmax / 6); if (S.tt >= S.tmax) S.kos = 0; }
      const deg = (P, t) => { for (let i = 1; i < P.length; i++) if (t <= P[i][0] || i === P.length - 1) { const [t0, y0] = P[i - 1], [t1, y1] = P[i]; return y0 + (y1 - y0) * Math.max(0, Math.min(1, (t - t0) / ((t1 - t0) || 1))); } return 0; };
      T.egri.forEach((m, k) => { const P = S.eg[k]; m.visible = !!P; T.nokta[k].visible = false; if (!P) return;
        // grafik verilen noktalardan BİREBİR geçen kırık çizgi (köşelerde taşma/yuvarlanma yok); eğriler (ör. P–V) yoğun noktayla verilir
        const yol = new THREE.CurvePath(); let seg = 0; for (let i = 1; i < P.length; i++) { const a = V3(X(P[i - 1][0]), Y(P[i - 1][1]), Z + 0.02), b = V3(X(P[i][0]), Y(P[i][1]), Z + 0.02); if (a.distanceTo(b) > 1e-4) { yol.add(new THREE.LineCurve3(a, b)); seg++; } }
        if (!seg) { m.visible = false; return; }
        m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(yol, Math.max(64, seg * 24), 0.035, 6);
        if (S.tt > 0) { const tq = Math.max(P[0][0], Math.min(P[P.length - 1][0], S.tt)); T.nokta[k].visible = true; T.nokta[k].position.set(X(tq), Y(deg(P, tq)), Z + 0.05); }   // nokta her zaman eğrinin üstünde
        if (S.adlar && S.adlar[k]) { const [tl, yl] = S.adlar[k]; FZ.setTag(['grA', 'grB', 'grC'][k], S.adlar[k][2]); FZ.show(['grA', 'grB', 'grC'][k], V3(X(tl), Y(yl), Z), 1, 0, -14); } });
      // hareket grafiklerinde arabalar: x–t'de doğrudan, v–t'de integral, a–t'de iki kez integral
      T.araba.forEach((a, k) => { const P = S.eg[k]; const hareket = S.araba && P && (S.tur === 'x' || S.tur === 'v' || S.tur === 'a'); a.visible = !!hareket; if (!hareket) return;
        const konum = tt => { if (S.tur === 'x') return deg(P, tt); const N = 60, h = tt / N; let x = 0, v = S.tur === 'a' ? (S.v0 || 0) : 0; for (let i = 0; i < N; i++) { const t = (i + 0.5) * h; if (S.tur === 'v') x += deg(P, t) * h; else { v += deg(P, t) * h; x += v * h; } } return x; };
        const x = konum(S.tt), ileri = S.tur === 'x' ? deg(P, Math.min(S.tmax, S.tt + 0.05)) - deg(P, S.tt) : S.tur === 'v' ? deg(P, S.tt + 0.01) : 1;
        a.position.set(-5.6 + x * S.olc, 0.04, 1.3 + k * 0.7); if (Math.abs(ileri) > 1e-6) a.rotation.y = ileri < 0 ? Math.PI : 0; });   // araba gittiği yöne bakar
      T.yol.visible = !!S.araba && ['x', 'v', 'a'].includes(S.tur);
    },
    qp: () => V3(0, 4.6, 0) });

  const G = o => S => Object.assign(S, { eg: [], etk: [], adlar: null, tt: 0, kos: 0, araba: 1, v0: 0, olc: 0.1, tA: 1, yA: 5, ymin: 0 }, o);
  const OYNAT = S => { S.tt = 0; S.kos = 1; };
  const banka = (sinav, ad, yk, icon, name, task, steps) => { steps.forEach(st => { if (st.goster && st.q && !st.q.goster) st.q.goster = st.goster; if (st.q) { st.q.goster = st.q.goster || OYNAT; if (!st.sub) st.sub = 'Grafik tahtası: grafik hesaplanarak çizilir; hareket grafiklerinde araba grafiğe göre gider.'; } });
    FZ.konuEk(sinav, ad, { gorevler: [gorev(sGr, { yk, no: 11, icon, name: 'Grafik soruları: ' + name, task, steps })] }); };
  const BASLA = o => ({ do: G(o), sub: 'Grafik tahtası: soruyu grafikten okuyun.', go: '▶︎ Başla' });

  // ---------------- HAREKET VE KUVVET · grafikler ----------------
  banka('TYT', 'Hareket ve Kuvvet', 'TYT3-gr', '📈', 'hareket', 'Konum–zaman, hız–zaman ve ivme–zaman grafiklerinden hız, yer değiştirme, ivme; karşılaşma; yön değiştirme; sürtünme grafiği.', [
    BASLA({ tur: 'x', eg: [[[0, 0], [8, 40]]], tmax: 8, ymax: 40, yA: 10, xEt: 't (s)', yEt: 'x (m)' }),
    { do: G({ tur: 'x', eg: [[[0, 0], [8, 40]]], tmax: 8, ymax: 40, yA: 10, xEt: 't (s)', yEt: 'x (m)' }), q: { t: 'Konum–zaman grafiği verilen arabanın hızı kaç m/s\'dir?', o: ['5', '40', '8', '320', '10'],
      b: ['Konum–zaman grafiğinin eğimi hızı verir: ' + FM(`v = ${F('Δx', 'Δt')}`)], s: [`v = ${F('40', '8')} = <em>5 m/s</em> ✓`] } },
    { do: G({ tur: 'v', eg: [[[0, 0], [4, 20], [8, 20]]], tmax: 8, ymax: 20, yA: 5, xEt: 't (s)', yEt: 'v (m/s)', olc: 0.06 }), q: { t: 'Hız–zaman grafiği verilen araba 8 s\'de kaç m yer değiştirir?', o: ['120', '160', '80', '40', '240'],
      b: ['Hız–zaman grafiğinin altındaki alan yer değiştirmeyi verir.'], s: [`0–4 s üçgen: ${F('1', '2')} · 4 · 20 = 40 m · 4–8 s dikdörtgen: 4 · 20 = 80 m`, 'Toplam = <em>120 m</em> ✓'] } },
    { do: G({ tur: 'v', eg: [[[0, 0], [4, 20], [8, 20]]], tmax: 8, ymax: 20, yA: 5, xEt: 't (s)', yEt: 'v (m/s)', olc: 0.06 }), q: { t: 'Aynı arabanın 0–4 s aralığındaki ivmesi kaç m/s²\'dir?', o: ['5', '20', '0', '4', '10'],
      b: ['Hız–zaman grafiğinin eğimi ivmeyi verir: ' + FM(`a = ${F('Δv', 'Δt')}`)], s: [`a = ${F('20 − 0', '4')} = <em>5 m/s²</em> ✓ (4–8 s arası a = 0)`] } },
    { do: G({ tur: 'a', eg: [[[0, 3], [4, 3]]], tmax: 4, ymin: 0, ymax: 4, yA: 1, xEt: 't (s)', yEt: 'a (m/s²)', v0: 2, olc: 0.15 }), q: { t: 'İlk hızı 2 m/s olan arabanın ivme–zaman grafiği veriliyor. 4. saniyenin sonunda hızı kaç m/s olur?', o: ['14', '12', '3', '16', '28'],
      b: ['İvme–zaman grafiğinin altındaki alan hız değişimini verir.'], s: ['Δv = 3 · 4 = 12 m/s', 'v = 2 + 12 = <em>14 m/s</em> ✓'] } },
    { do: G({ tur: 'x', eg: [[[0, 0], [6, 60]], [[0, 60], [6, 30]]], tmax: 6, ymax: 60, yA: 10, xEt: 't (s)', yEt: 'x (m)', adlar: [[5.6, 56, 'K'], [5.6, 33, 'L']], olc: 0.15 }), q: { t: 'K ve L arabalarının konum–zaman grafikleri veriliyor. Arabalar kaçıncı saniyede yan yana gelir?', o: ['4', '3', '6', '2', '8'],
      b: ['Konum–zaman grafiklerinin kesiştiği an, iki aracın aynı konumda olduğu (karşılaştığı) andır.'], s: ['K: x = 10t · L: x = 60 − 5t', '10t = 60 − 5t → t = <em>4 s</em> ✓ (x = 40 m)'] } },
    { do: G({ tur: 'v', eg: [[[0, 10], [4, -10]]], tmax: 4, ymin: -10, ymax: 10, yA: 5, xEt: 't (s)', yEt: 'v (m/s)', olc: 0.25 }), q: { t: 'Hız–zaman grafiği verilen cisim kaçıncı saniyede yön değiştirir?', o: ['2', '4', '0', 'Yön değiştirmez'],
      b: ['Hızın İŞARETİ hareket yönünü gösterir: hız sıfırdan geçip işaret değiştirince cisim geri döner.'], s: ['v = 10 − 5t = 0 → t = <em>2 s</em> ✓'], n: ['0–2 s yavaşlar, 2–4 s ters yönde hızlanır; ivme hep −5 m/s².'] } },
    { do: G({ tur: 'v', eg: [[[0, 12], [3, 0]]], tmax: 3, ymax: 12, yA: 4, xEt: 't (s)', yEt: 'v (m/s)', olc: 0.3 }), q: { t: 'Hız–zaman grafiğine göre araba için hangisi doğrudur?', o: ['Düzgün yavaşlayarak durur; 18 m yol alır', 'Düzgün hızlanır; 36 m yol alır', 'Sabit hızla gider', 'Durur, sonra geri döner'],
      b: ['Eğim ivmeyi, alan yolu verir.'], s: ['Hız düzgün azalıyor → düzgün yavaşlama (a = −4 m/s²)', `Yol = ${F('1', '2')} · 3 · 12 = <em>18 m</em> ✓`] } },
    { do: G({ tur: 'f', araba: 0, eg: [[[0, 0], [20, 20], [20, 15], [30, 15]]], tmax: 30, ymax: 25, tA: 5, yA: 5, xEt: 'F (N)', yEt: 'f (N)' }), q: { t: 'Yatay zemindeki kutuya uygulanan kuvvet (F) ile sürtünme kuvvetinin (f) grafiği veriliyor. Kutu hangi kuvvette kaymaya başlar ve kayarken sürtünme kaç N\'dur?', o: ['20 N; 15 N', '15 N; 20 N', '20 N; 20 N', '30 N; 15 N'],
      b: ['Statik sürtünme uygulanan kuvvete eşit olur ve en büyük değerine kadar artar; kayma başlayınca sabit kinetik sürtünme etki eder (genelde statikten küçük).'], s: ['f, F ile 20 N\'a kadar artar → <em>20 N\'da</em> kayar', 'Sonra sabit <em>15 N</em> (kinetik) ✓'] } },
    { do: G({ tur: 'Fa', araba: 0, eg: [[[0, 0], [5, 20]], [[0, 0], [5, 10]]], tmax: 5, ymax: 20, yA: 5, xEt: 'a (m/s²)', yEt: 'F (N)', adlar: [[4.6, 18.4, 'K'], [4.6, 9.2, 'L']] }), q: { t: 'K ve L cisimlerine uygulanan net kuvvet–ivme grafikleri veriliyor. Kütleleri oranı m<sub>K</sub> / m<sub>L</sub> kaçtır?', o: ['2', '½', '4', '1'],
      b: [FM('F = m · a') + ' → F–a grafiğinin eğimi kütleyi verir.'], s: [`m<sub>K</sub> = ${F('20', '5')} = 4 kg · m<sub>L</sub> = ${F('10', '5')} = 2 kg`, 'Oran = <em>2</em> ✓'] } },
  ]);

  // ---------------- MADDE · m–V grafiği ----------------
  banka('TYT', 'Madde ve Özellikleri', 'TYT2-gr', '📈', 'madde', 'Kütle–hacim grafiğinden özkütle, sıvıların kaptaki dizilişi, karışım.', [
    BASLA({ tur: 'mV', araba: 0, eg: [[[0, 0], [20, 40]], [[0, 0], [40, 40]], [[0, 0], [50, 25]]], tmax: 50, ymax: 40, tA: 10, yA: 10, xEt: 'V (cm³)', yEt: 'm (g)', adlar: [[18, 36, 'X'], [36, 36, 'Y'], [46, 23, 'Z']] }),
    { do: G({ tur: 'mV', araba: 0, eg: [[[0, 0], [20, 40]], [[0, 0], [40, 40]], [[0, 0], [50, 25]]], tmax: 50, ymax: 40, tA: 10, yA: 10, xEt: 'V (cm³)', yEt: 'm (g)', adlar: [[18, 36, 'X'], [36, 36, 'Y'], [46, 23, 'Z']] }), q: { t: 'Birbirine karışmayan X, Y, Z sıvılarının kütle–hacim grafikleri veriliyor. Sıvılar aynı kaba konursa en alttan yukarı sıralama nasıl olur?', o: ['X, Y, Z', 'Z, Y, X', 'Y, X, Z', 'X, Z, Y'],
      b: ['Kütle–hacim grafiğinin eğimi özkütleyi verir: ' + FM(`d = ${F('m', 'V')}`), 'Karışmayan sıvılarda özkütlesi büyük olan alta iner.'], s: ['d<sub>X</sub> = 2 · d<sub>Y</sub> = 1 · d<sub>Z</sub> = 0,5 g/cm³', 'Alttan yukarı: <em>X, Y, Z</em> ✓'] } },
    { do: G({ tur: 'mV', araba: 0, eg: [[[0, 0], [20, 40]], [[0, 0], [40, 40]]], tmax: 40, ymax: 40, tA: 10, yA: 10, xEt: 'V (cm³)', yEt: 'm (g)', adlar: [[18, 36, 'X'], [36, 36, 'Y']] }), q: { t: 'Grafikteki X ve Y sıvılarından 20\'şer cm³ karıştırılırsa karışımın özkütlesi kaç g/cm³ olur?', o: ['1,5', '3', '1', '2', '0,75'],
      b: [FM(`d<sub>k</sub> = ${F('m<sub>X</sub> + m<sub>Y</sub>', 'V<sub>X</sub> + V<sub>Y</sub>')}`)], s: ['Grafikten: 20 cm³ X = 40 g, 20 cm³ Y = 20 g', `d = ${F('60', '40')} = <em>1,5 g/cm³</em> ✓`] } },
  ]);

  // ---------------- ENERJİ · F–x ve E–konum grafikleri ----------------
  banka('TYT', 'Enerji', 'TYT4-gr', '📈', 'enerji', 'Kuvvet–yol grafiğinden iş, lastik uzaması, enerji–konum grafiği.', [
    BASLA({ tur: 'Fx', araba: 0, eg: [[[0, 10], [4, 10], [6, 0]]], tmax: 6, ymax: 12, yA: 2, xEt: 'x (m)', yEt: 'F (N)' }),
    { do: G({ tur: 'Fx', araba: 0, eg: [[[0, 10], [4, 10], [6, 0]]], tmax: 6, ymax: 12, yA: 2, xEt: 'x (m)', yEt: 'F (N)' }), q: { t: 'Cisme hareket doğrultusunda uygulanan kuvvetin yola bağlı grafiği veriliyor. 0–6 m arasında kuvvetin yaptığı iş kaç J\'dür?', o: ['50', '60', '40', '10', '100'],
      b: ['Kuvvet–yol grafiğinin altındaki alan işi verir.'], s: [`0–4 m: 10 · 4 = 40 J · 4–6 m: ${F('1', '2')} · 2 · 10 = 10 J`, 'Toplam = <em>50 J</em> ✓'] } },
    { do: G({ tur: 'Fx', araba: 0, eg: [[[0, 0], [0.4, 20]]], tmax: 0.5, ymax: 25, tA: 0.1, yA: 5, xEt: 'x (m)', yEt: 'F (N)' }), q: { t: 'Bir lastiğin uzama–kuvvet grafiği doğrusal: 0,4 m uzaması için 20 N gerekiyor. Lastikte depolanan enerji kaç J\'dür?', o: ['4', '8', '20', '2', '12'],
      b: ['Kuvvet–uzama grafiğinin altındaki alan depolanan esneklik potansiyel enerjisini verir.'], s: [`E = ${F('1', '2')} · 0,4 · 20 = <em>4 J</em> ✓`], n: ['Yay sabiti k = 20 / 0,4 = 50 N/m; E = ½ k x² = ½ · 50 · 0,16 = 4 J (2. YOL).'] } },
    { do: G({ tur: 'E', araba: 0, eg: [[[0, 100], [5, 100]], [[0, 100], [5, 0]], [[0, 0], [5, 100]]], tmax: 5, ymax: 120, yA: 20, xEt: 'konum', yEt: 'E (J)', adlar: [[4.5, 108, 'Toplam'], [4.5, 18, 'E<sub>p</sub>'], [4.5, 82, 'E<sub>k</sub>']] }), q: { t: 'Sürtünmesiz rampadan kayan cismin enerji–konum grafikleri veriliyor. Cisim rampanın ortasındayken kinetik enerjisi kaç J\'dür?', o: ['50', '100', '0', '25', '150'],
      b: ['Sürtünme yoksa mekanik enerji korunur: E<sub>k</sub> + E<sub>p</sub> = sabit.'], s: ['Ortada E<sub>p</sub> = 50 J (grafikten)', 'E<sub>k</sub> = 100 − 50 = <em>50 J</em> ✓'] } },
  ]);

  // ---------------- ISI · T–Q grafiği ----------------
  banka('TYT', 'Isı ve Sıcaklık', 'TYT5-gr', '📈', 'ısı', 'Sıcaklık–ısı grafiğinden öz ısı, ısı sığası, hal değişimi.', [
    BASLA({ tur: 'TQ', araba: 0, eg: [[[0, 20], [4, 60]], [[0, 20], [4, 40]]], tmax: 4, ymax: 70, yA: 10, xEt: 'Q (kcal)', yEt: 'T (°C)', adlar: [[3.6, 57, 'K'], [3.6, 38, 'L']] }),
    { do: G({ tur: 'TQ', araba: 0, eg: [[[0, 20], [4, 60]], [[0, 20], [4, 40]]], tmax: 4, ymax: 70, yA: 10, xEt: 'Q (kcal)', yEt: 'T (°C)', adlar: [[3.6, 57, 'K'], [3.6, 38, 'L']] }), q: { t: 'Kütleleri eşit K ve L maddelerinin sıcaklık–ısı grafikleri veriliyor. Öz ısılarının oranı c<sub>K</sub> / c<sub>L</sub> kaçtır?', o: ['½', '2', '1', '¼'],
      b: [FM('Q = m · c · ΔT') + ' → aynı Q için ΔT küçük olanın öz ısısı büyüktür.'], s: ['4 kcal ile K 40 °C, L 20 °C ısınıyor', `${F('c<sub>K</sub>', 'c<sub>L</sub>')} = ${F('ΔT<sub>L</sub>', 'ΔT<sub>K</sub>')} = ${F('20', '40')} = <em>½</em> ✓`] } },
    { do: G({ tur: 'TQ', araba: 0, eg: [[[0, -20], [1, 0], [9, 0], [14, 50]]], tmax: 14, ymin: -20, ymax: 60, tA: 2, yA: 20, xEt: 'Q (kcal)', yEt: 'T (°C)' }), q: { t: '−20 °C\'deki 100 g buza verilen ısıya karşı sıcaklık grafiği veriliyor. Grafiğin yatay kısmı neyi gösterir?', o: ['Buzun erimesini; sıcaklık sabit kalır', 'Suyun kaynamasını', 'Isı verilmediğini', 'Buzun ısındığını'],
      b: ['Hal değişimi sırasında verilen ısı bağları koparmaya harcanır; sıcaklık değişmez.'], s: ['0 °C\'de sabit kalan bölüm <em>erime</em> ✓', 'Bu bölümde 8 kcal = 100 g · 80 cal/g verilmiştir.'] } },
  ]);

  // ---------------- BASINÇ · P–V ve P–h grafikleri ----------------
  banka('TYT', 'Basınç ve Kaldırma Kuvveti', 'TYT8-gr', '📈', 'basınç', 'Sıvı basıncı–derinlik, gaz basıncı–hacim grafikleri.', [
    BASLA({ tur: 'Ph', araba: 0, eg: [[[0, 0], [5, 50]], [[0, 0], [5, 40]]], tmax: 5, ymax: 50, yA: 10, xEt: 'h (m)', yEt: 'P (kPa)', adlar: [[4.6, 46, 'X'], [4.6, 37, 'Y']] }),
    { do: G({ tur: 'Ph', araba: 0, eg: [[[0, 0], [5, 50]], [[0, 0], [5, 40]]], tmax: 5, ymax: 50, yA: 10, xEt: 'h (m)', yEt: 'P (kPa)', adlar: [[4.6, 46, 'X'], [4.6, 37, 'Y']] }), q: { t: 'X ve Y sıvılarında derinliğe bağlı sıvı basıncı grafikleri veriliyor. Y sıvısının özkütlesi kaç kg/m³\'tür? (g = 10 m/s²)', o: ['800', '1000', '400', '8000', '1600'],
      b: [FM('P = h · d · g') + ' → P–h grafiğinin eğimi d · g\'dir.'], s: [`Y: eğim = ${F('40 000 Pa', '5 m')} = 8000 = d · 10`, 'd = <em>800 kg/m³</em> ✓ (X: 1000 kg/m³, su)'] } },
    { do: G({ tur: 'PV', araba: 0, eg: [Array.from({ length: 51 }, (_, i) => { const V = 1 + i * 0.1; return [V, 12 / V]; })], etk: [[2, 6, '(2 L, 6 atm)'], [4, 3, '(4 L, ?)']], tmax: 6, ymax: 12, yA: 2, xEt: 'V (L)', yEt: 'P (atm)' }), q: { t: 'Sabit sıcaklıkta kapalı kaptaki gazın basınç–hacim grafiği veriliyor. Hacim 2 L iken basınç 6 atm ise 4 L iken basınç kaç atm olur?', o: ['3', '12', '6', '1,5', '9'],
      b: ['Boyle–Mariotte yasası (sabit sıcaklık): ' + FM('P<sub>1</sub> V<sub>1</sub> = P<sub>2</sub> V<sub>2</sub>')], s: ['6 · 2 = P · 4 → P = <em>3 atm</em> ✓'] } },
  ]);

  // ======================= KALAN SORU TİPLERİ: elektroskop, lambalar, pusula, ısı yalıtımı =======================
  const ek = (sinav, ad, sahne, yk, icon, name, task, steps, gizle) => { if (!sahne) return;
    steps.forEach(st => { if (st.goster && st.q && !st.q.goster) st.q.goster = st.goster; if (st.q) { st.q.kartGizle = true; if (gizle) st.q.gizle = (st.q.gizle || []).concat(gizle); if (!st.sub) st.sub = steps[0].sub; } });
    FZ.konuEk(sinav, ad, { gorevler: [gorev(sahne, { yk, no: 12, icon, name, task, steps })] }); };
  const D = o => S => Object.assign(S, o);
  const es = (eq, cub) => ({ mod: 'elskop', eq, cub, yak: 0, ey: 0 }), esG = S => { S.yak = 1; };
  ek('TYT', 'Elektrostatik', SH.elLab, 'TYT6-es', '🔋', 'Elektroskop durumları', 'Yüklü/nötr elektroskoba (+), (−) ve nötr cisim yaklaştırma; yaprakların açılıp kapanması.', [
    { do: D(es(4, 1)), sub: 'Elektroskop ve yüklü çubuklar.', go: '▶︎ Başla' },
    { do: D(es(0, -1)), goster: esG, q: { t: 'Nötr elektroskobun topuzuna (−) yüklü çubuk dokundurulmadan yaklaştırılıyor. Yapraklar ne yapar ve hangi yükle yüklenir?', o: ['Açılır; yapraklar (−)', 'Açılır; yapraklar (+)', 'Kapalı kalır', 'Açılır; topuz (−)'],
      b: ['Etki ile elektriklenme: yaklaşan çubuk elektronları iter ya da çeker; elektroskobun toplam yükü değişmez.'], s: ['(−) çubuk elektronları topuzdan yapraklara iter → topuz (+), yapraklar <em>(−)</em>, yapraklar açılır ✓'] } },
    { do: D(es(-4, -1)), goster: esG, q: { t: '(−) yüklü elektroskoba (−) yüklü çubuk yaklaştırılıyor. Yapraklar ne yapar?', o: ['Daha çok açılır', 'Kapanır', 'Değişmez', 'Önce kapanır sonra açılır'],
      b: ['Aynı işaretli çubuk, elektroskobun yükünü yapraklara doğru iter.'], s: ['Yapraklardaki (−) yük artar → <em>daha çok açılır</em> ✓'], n: ['Açılmanın artması, yaklaşan cismin elektroskopla AYNI işaretli olduğunu kesin gösterir.'] } },
    { do: D(es(4, 1)), goster: esG, q: { t: '(+) yüklü elektroskoba (+) yüklü çubuk yaklaştırılıyor. Topuzdaki yük için ne söylenir?', o: ['Topuzdaki (+) yük azalır, yapraklardaki artar', 'Topuz (−) olur', 'Topuzun yükü değişmez', 'Elektroskobun toplam yükü artar'],
      b: ['(+) çubuk elektronları kendine (topuza) çeker.'], s: ['Elektronlar topuza gelir → topuzdaki (+) azalır, yapraklarda (+) <em>artar</em> ✓; toplam yük aynıdır.'] } },
  ], ['esT', 'esC']);

  const dv = x => Object.assign({ mod: 'seri', V: 12, R1: 4, R2: 4, ac: 1, pil: 1, ters: 0 }, x || {});
  ek('TYT', 'Elektrik ve Manyetizma', SH.elektrik, 'TYT7-lm', '💡', 'Lambalar, kısa devre ve pusula', 'Lamba parlaklığı, kısa devre, anahtarla kol ekleme, pusula ve Dünya\'nın manyetik alanı, bobin kutupları.', [
    { do: D(dv()), sub: 'Devre tahtası, pusula ve mıknatıslar.', go: '▶︎ Başla' },
    { do: D(dv()), q: { t: 'Seri bağlı özdeş K ve L lambalarından K\'nin uçları iletken bir telle birleştiriliyor (kısa devre). Lambalar ne olur?', o: ['K söner, L daha parlak yanar', 'İkisi de söner', 'K daha parlak, L söner', 'Hiçbiri değişmez'],
      b: ['Akım direnci en küçük yolu tercih eder; direnci sıfır tel lambayı devre dışı bırakır.'], s: ['K\'den akım geçmez → <em>K söner</em>', 'Devrenin direnci yarıya iner, L\'nin gerilimi 2 katına çıkar → <em>L daha parlak</em> ✓'] } },
    { do: D(dv({ mod: 'paralel', R1: 4, R2: 4 })), q: { t: 'Üretece bağlı tek lambaya anahtar kapatılarak özdeş ikinci lamba PARALEL ekleniyor (iç direnç önemsiz). İlk lambanın parlaklığı ne olur?', o: ['Değişmez', 'Azalır', 'Artar', 'Söner'],
      b: ['Paralel kolların gerilimi üretecin gerilimine eşittir.'], s: ['İlk lambanın gerilimi değişmez → <em>parlaklığı değişmez</em> ✓', 'Üreteçten çekilen toplam akım 2 katına çıkar.'] } },
    { do: D(dv({ R1: 4, R2: 4 })), q: { t: 'Üretece bağlı tek lambaya özdeş ikinci lamba SERİ eklenirse ilk lambanın parlaklığı ne olur?', o: ['Azalır (gücü ¼\'üne iner)', 'Değişmez', 'Artar', 'Yarıya iner'],
      b: [FM(`P = ${F('V<sup>2</sup>', 'R')}`) + ' · seri özdeş lambalar gerilimi eşit paylaşır.'], s: ['Her lambanın gerilimi V/2 → P ∝ V² → <em>¼</em> ✓'] } },
    { do: D({ mod: 'mikn', it: 0, ayr: 0.6 }), q: { t: 'Pusulanın N ucu, yakındaki çubuk mıknatısın hangi kutbuna doğru döner?', o: ['S kutbuna', 'N kutbuna', 'Mıknatısın ortasına', 'Dönmez'],
      b: ['Zıt manyetik kutuplar birbirini çeker; pusula iğnesi küçük bir mıknatıstır.'], s: ['N ucu zıt kutup olan <em>S\'ye</em> yönelir ✓'], n: ['Manyetik alan çizgileri mıknatısın dışında N\'den S\'ye yönelir; pusula N ucu alan yönünü gösterir.'] } },
    { do: D({ mod: 'mikn', it: 0, ayr: 0.6 }), q: { t: 'Serbestçe dönebilen (düşey düzlemde de eğilebilen) pusula iğnesi ekvatorda ve manyetik kutupta nasıl durur?', o: ['Ekvatorda yatay, kutupta düşeye yakın', 'İkisinde de yatay', 'Ekvatorda düşey, kutupta yatay', 'İkisinde de düşey'],
      b: ['Dünya\'nın manyetik alan çizgileri ekvatorda yere paralel, kutuplarda yere dik doğrultudadır.'], s: ['İğne alan çizgilerine paralel durur → ekvatorda <em>yatay</em>, kutupta <em>düşeye yakın</em> ✓ (manyetik eğim açısı)'] } },
    { do: D({ mod: 'mikn', it: 1, ayr: 0.6 }), q: { t: 'Akım geçen bobinin hangi ucunun N kutbu olduğu nasıl bulunur?', o: ['Sağ el: dört parmak akım yönünde kıvrılırsa başparmak N\'yi gösterir', 'Akımın girdiği uç her zaman N\'dir', 'Bobinin uzun tarafı N\'dir', 'Telin rengine bakılır'],
      b: ['Sağ el kuralı (bobin): dört parmak sarımlardaki akım yönünde kıvrılır.'], s: ['Başparmak bobinin içindeki alanı ve <em>N kutbunu</em> gösterir ✓'], n: ['Akım ters çevrilirse kutuplar yer değiştirir.'] } },
  ]);

  const is2 = (mod, x) => Object.assign({ mod, kos: 0 }, x || {});
  ek('TYT', 'Isı ve Sıcaklık', SH.isi, 'TYT5-yl', '🏠', 'Isı yalıtımı ve genleşme tasarımları', 'Çift cam, termos, iglo, koyu renkli araç, bimetal, su anomalisi, sıvı genleşmesi.', [
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), sub: 'Isı laboratuvarı.', go: '▶︎ Başla' },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: 'Çift camlı pencerelerde iki cam arasında hava ya da gaz bırakılmasının nedeni nedir?', o: ['Gazlar ısıyı iletimle çok kötü iletir', 'Hava ışığı kırar', 'Cam daha az genleşir', 'Ses daha hızlı geçer'],
      b: ['Isı iletim katsayısı: metaller büyük, cam orta, hava (gazlar) çok küçük.'], s: ['Aradaki ince hava tabakası iletimi azaltır → ısı kaybı <em>azalır</em> ✓'] } },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: 'Termosun iki cam çeperi arasının havasının boşaltılması ve çeperlerin parlak gümüş renkte olması hangi ısı yayılma yollarını engeller?', o: ['Boşluk iletim ve konveksiyonu, parlak yüzey ışımayı', 'Boşluk ışımayı, parlak yüzey iletimi', 'Yalnız iletimi', 'Hiçbirini'],
      b: ['Isı üç yolla yayılır: iletim (temas), konveksiyon (akışkanın hareketi), ışıma (elektromanyetik dalga, boşlukta da yayılır).'], s: ['Boşlukta tanecik yok → iletim ve konveksiyon olmaz; parlak yüzey ışımayı yansıtır ✓'] } },
    { do: D(is2('ray', { gun: 1 })), q: { t: 'Bimetal şerit (üstte pirinç, altta çelik; pirincin uzama katsayısı büyük) SOĞUTULURSA nasıl bükülür?', o: ['Yukarı, pirinç tarafına', 'Aşağı, çelik tarafına', 'Bükülmez', 'Önce aşağı sonra yukarı'],
      b: ['Soğuyunca uzama katsayısı büyük olan daha çok kısalır; kısalan taraf yayın içinde kalır.'], s: ['Pirinç daha çok kısalır → iç tarafta pirinç: şerit <em>yukarı, pirinç tarafına</em> bükülür ✓'], n: ['Isıtılınca tersi olur: çelik tarafına bükülür.'] } },
    { do: D(is2('ray', { gun: 0 })), q: { t: 'Kışın göllerin yüzeyden donması ve altta canlıların yaşayabilmesinin nedeni nedir?', o: ['Su 4 °C\'de en yoğundur; dipte 4 °C\'lik su kalır', 'Buz sudan ağırdır', 'Göl tabanı sıcak kaynaktır', 'Suyun öz ısısı küçüktür'],
      b: ['Suyun özkütlesi 4 °C\'de en büyüktür; buzun özkütlesi sudan küçüktür.'], s: ['Yoğun 4 °C\'lik su dibe çöker, soğuyan su ve buz üstte kalır → buz yalıtıcı örtü olur ✓'] } },
    { do: D(is2('termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 40 })), q: { t: 'Ağzına kadar sıvı dolu cam kap ısıtılınca sıvı taşıyor. Bunun nedeni nedir?', o: ['Sıvının hacimce genleşmesi kabınkinden büyüktür', 'Kap büzülür', 'Sıvının kütlesi artar', 'Sıvı buharlaşır'],
      b: ['Isınan kap da genleşir; sıvıların genleşme katsayısı genellikle katılardan büyüktür.'], s: ['Sıvı, kaptan <em>daha çok genleşir</em> → taşar ✓ (görünür genleşme)'] } },
  ]);
})();
