// Animasyon programı · Isı ve Sıcaklık Laboratuvarı (ısınma eğrisi ve hal değişimi, kendi termometreni yap, bimetal, gölün 4 °C\'si)
// ve Çembersel Hareket Laboratuvarı (döner tabla, konik sarkaç, düz viraj, tümsek ve çukur)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };

  // =====================================================================
  // ISI LABORATUVARI
  // =====================================================================
  // 100 g buz, −20 °C'den 120 °C buhara: c_buz = 0,5 · L_e = 80 · c_su = 1 · L_b = 540 · c_buhar ≈ 0,5 (cal)
  const QS = [0, 1000, 9000, 19000, 73000, 74000];   // bölüm sınırları (cal)
  const TQ = q => q < QS[1] ? -20 + 20 * q / QS[1] : q < QS[2] ? 0 : q < QS[3] ? 100 * (q - QS[2]) / (QS[3] - QS[2]) : q < QS[4] ? 100 : 100 + 20 * (q - QS[4]) / (QS[5] - QS[4]);
  const GX = q => -3.4 + 3.2 * Math.pow(q / QS[5], 0.55), GY = T => 1.2 + (T + 20) / 140 * 2.6, GZ = -1.2;   // Q ekseni karekök ölçekli (kısa bölümler de görünsün)
  const sIs = sahne({ icon: '🌡️', cam: [[1.3, 3.2, 12.5], [1.3, 2, 0]], plate: [11, 4, 0, 0], data: [['Buz', '100 g, −20 °C'], ['L<sub>erime</sub>', '80 cal/g'], ['L<sub>buharlaşma</sub>', '540 cal/g']],
    S0: () => ({ mod: 'egri', q: 0, kos: 0, T: 20, isit: 0 }),
    kur(g) {
      const G = {}; ['egri', 'bimetal', 'gol'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      // ısınma: ocak, kap, buz, su, buhar
      const oc = FZ.ocak(G.egri, 1.6); oc.position.set(2.2, 0.1, 0); const alev = oc.alev;
      silindir(G.egri, 0.65, 0.6, 1.3, 0xe0f2fe, 2.2, 1.35, 0, { op: 0.25, edge: false });
      const buz = [[1.98, -0.12], [2.42, -0.12], [2.2, 0.26]].map(([x, z]) => { const b_ = kutu(G.egri, 0.36, 0.36, 0.36, 0xbae6fd, x, 0.9, z); b_.material.emissive = new THREE.Color(0x0ea5e9); b_.material.emissiveIntensity = 0.25; return b_; });   // opak açık mavi buz küpleri (kabın tabanında)
      const su = silindir(G.egri, 0.58, 0.58, 1, 0x3b82f6, 2.2, 0.75, 0, { op: 0.55, edge: false });
      const buhar = []; for (let i = 0; i < 10; i++) buhar.push(top(G.egri, 0.07, 0xf1f5f9, 2.2, 2, 0, { op: 0.7, edge: false }));
      const pano = kutu(G.egri, 4, 3.3, 0.05, 0x111827, -1.8, 2.45, GZ - 0.05, { edge: false });
      const eks = duz(G.egri, 0xe5e7eb); FZ.setLine(eks, [V3(GX(0), GY(140), GZ), V3(GX(0), GY(-20), GZ), V3(-0.1, GY(-20), GZ)]);
      const ref = duz(G.egri, 0x475569); FZ.setLine(ref, [V3(GX(0), GY(100), GZ), V3(-0.1, GY(100), GZ)]); const ref0 = duz(G.egri, 0x475569); FZ.setLine(ref0, [V3(GX(0), GY(0), GZ), V3(-0.1, GY(0), GZ)]);
      const egri = duz(G.egri, 0xfbbf24);
      // bimetal: pirinç (üst) + çelik (alt) şerit, sol uç sabit
      kutu(G.bimetal, 0.4, 1.6, 0.6, 0x334155, -2.6, 0.8, 0);
      const ser = []; for (let i = 0; i < 20; i++) { ser.push([kutu(G.bimetal, 0.2, 0.07, 0.4, 0xd4a72c, 0, 0, 0, { edge: false }), kutu(G.bimetal, 0.2, 0.07, 0.4, 0x94a3b8, 0, 0, 0, { edge: false })]); }
      const ocak2 = kutu(G.bimetal, 4, 0.12, 0.8, 0x7f1d1d, -0.4, 0.06, 0, { edge: false });
      // göl: katmanlar
      const kat = []; for (let i = 0; i < 5; i++) kat.push(kutu(G.gol, 6, 0.55, 2, 0x1d4ed8, 0, 0.3 + i * 0.55, 0, { op: 0.6, edge: false }));
      const buzT = kutu(G.gol, 6, 0.2, 2, 0xe0f2fe, 0, 3.15, 0, { op: 0.9 });
      const balik = new THREE.Group(); G.gol.add(balik); top(balik, 0.2, 0xf97316, 0, 0, 0, { edge: false }).scale.set(1.6, 0.8, 0.6); const kuyruk = FZ.mesh(new THREE.ConeGeometry(0.15, 0.3, 8), 0xf97316, { edge: false }); kuyruk.rotation.z = Math.PI / 2; kuyruk.position.x = -0.4; balik.add(kuyruk);
      ['hsK0', 'hsK1', 'hsK2', 'hsK3', 'hsK4'].forEach(id => etiket(id, '', '#1e3a8a'));
      etiket('hsY0', '0 °C', '#475569'); etiket('hsY1', '100 °C', '#475569'); etiket('hsQ', 'Q (verilen ısı)', '#475569'); etiket('hsTT', 'T', '#475569');
      kart('hsT', '', '#F5C400'); etiket('hsA', '', '#b45309'); etiket('hsB', '', '#475569');
      return { G, alev, buz, su, buhar, egri, ser, ocak2, kat, buzT, balik };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      if (S.mod === 'egri') {
        if (S.kos) { S.q = Math.min(QS[5], S.q + dt * (S.q < QS[3] ? 3200 : 12000)); if (S.q >= (S.dur || QS[5])) { S.q = Math.min(S.q, S.dur || QS[5]); S.kos = 0; } }
        const T = TQ(S.q), eri = Math.max(0, Math.min(1, (S.q - QS[1]) / (QS[2] - QS[1]))), kay = Math.max(0, Math.min(1, (S.q - QS[3]) / (QS[4] - QS[3])));
        o.alev.visible = !!S.kos; o.alev.scale.y = 0.8 + 0.3 * Math.random();
        o.buz.forEach((b, i) => { b.visible = eri < 1; b.scale.setScalar(Math.max(0.05, 1 - eri)); });
        const hs = Math.max(0.01, 0.9 * eri * (1 - kay)); o.su.scale.y = hs; o.su.position.y = 0.72 + hs / 2; o.su.visible = hs > 0.02;
        o.buhar.forEach((b, i) => { b.visible = S.q > QS[3] && S.q < QS[5] + 1 && (kay > 0 || T >= 100); const f = (S.t * 0.6 + i / 10) % 1; b.position.set(2.2 + Math.sin(i * 2.3) * 0.4, 1.6 + f * 1.8, Math.cos(i * 1.7) * 0.3); b.material.opacity = 0.7 * (1 - f); });
        const pts = []; for (let k = 0; k <= 80; k++) { const q = S.q * k / 80; pts.push(V3(GX(q), GY(TQ(q)), GZ)); } FZ.setLine(o.egri, pts);
        FZ.show('hsY0', V3(GX(0) - 0.45, GY(0), GZ), 1); FZ.show('hsY1', V3(GX(0) - 0.55, GY(100), GZ), 1); FZ.show('hsQ', V3(-1.2, GY(-20) - 0.35, GZ), 1); FZ.show('hsTT', V3(GX(0), GY(140) + 0.25, GZ), 1);
        const faz = S.q < QS[1] ? 'Buz ısınıyor' : S.q < QS[2] ? 'Buz eriyor (T sabit)' : S.q < QS[3] ? 'Su ısınıyor' : S.q < QS[4] ? 'Su kaynıyor (T sabit)' : 'Buhar ısınıyor';
        FZ.setTag('hsT', `${faz} · T = ${fs(T)} °C · Q = ${Math.round(S.q / 1000)} kcal`); FZ.show('hsT', V3(0.4, 4.4, 0), 1);
      } else if (S.mod === 'bimetal') {
        S.T += ((S.isit ? 120 : 20) - S.T) * Math.min(1, dt * 0.8); const k = (S.T - 20) / 100 * 0.42;   // eğrilik (1/birim)
        o.ocak2.material.color.setHex(S.isit ? 0xdc2626 : 0x7f1d1d);
        let x = -2.4, y = 1.4, a = 0; const L = 0.2;
        o.ser.forEach(([p, c]) => { const ca = Math.cos(a), sa = Math.sin(a); p.position.set(x + ca * L / 2 - sa * 0.035, y + sa * L / 2 + ca * 0.035, 0); c.position.set(x + ca * L / 2 + sa * 0.035, y + sa * L / 2 - ca * 0.035, 0); p.rotation.z = c.rotation.z = a; x += ca * L; y += sa * L; a -= k * L; });
        FZ.setTag('hsA', 'pirinç (λ büyük)'); FZ.show('hsA', V3(-1.4, 2.1, 0), 1); FZ.setTag('hsB', 'çelik (λ küçük)'); FZ.show('hsB', V3(-0.6, 0.75, 0.4), 1);
        FZ.setTag('hsT', `T = ${Math.round(S.T)} °C${S.T > 30 ? ' · pirinç daha çok uzar, şerit çelik tarafına bükülür' : ''}`); FZ.show('hsT', V3(0, 3.6, 0), 1);
      } else {
        const T = [4, 4, 3, 2, 1];
        o.kat.forEach((m, i) => { m.material.color.setRGB(0.1 + i * 0.12, 0.3 + i * 0.1, 0.85); FZ.setTag('hsK' + i, `${T[i]} °C`); FZ.show('hsK' + i, V3(3.4, 0.3 + i * 0.55, 1), 1); });
        o.balik.position.set(Math.sin(S.t * 0.6) * 2, 0.5, 0.3); o.balik.rotation.y = Math.cos(S.t * 0.6) > 0 ? 0 : Math.PI;
        FZ.setTag('hsA', 'buz 0 °C'); FZ.show('hsA', V3(-2.4, 3.6, 0.8), 1);
        FZ.setTag('hsT', 'Su en yoğun 4 °C\'de: dipte toplanır · buz yüzer ve yalıtkan örtü olur'); FZ.show('hsT', V3(0, 4.3, 0), 1);
      }
    },
    qp: () => V3(0.4, 4, 0) });
  const egriK = (S, dur) => Object.assign(S, { mod: 'egri', q: 0, kos: 0, dur });

  const dIs = ders(sIs, { yk: 'TYT5-d3', no: 3, icon: '🧊', name: 'Isı laboratuvarı: hal değişimi, termometre, genleşme', task: 'Isınma eğrisi ve gizli ısı, kendi termometreni yap, öz ısı ve ısı sığası, bimetal, suyun 4 °C davranışı.', steps: [
    { do: S => egriK(S), k: { tur: 'merak', b: 'Kaynayan suyun sıcaklığı neden 100 °C\'de takılı kalır?', m: ['−20 °C\'deki 100 g buzu sürekli ısıtıp sıcaklık–ısı grafiğini çizeceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { p: { t: 'Buz erirken ocak ısı vermeye devam ediyor. Bu sırada karışımın sıcaklığı ne olur?', o: ['Düzgün artar', '0 °C\'de sabit kalır', 'Azalır', 'Önce artar sonra azalır'], d: 1 } },
    { sub: 'Ocağı yakalım.', go: '▶︎ Isıt' },
    { do: S => { S.dur = QS[3]; S.kos = 1; }, sub: 'Buz ısınıyor, eriyor, su ısınıyor…', until: S => S.q >= QS[3] },
    { k: { tur: 'gozlem', sonuc: true, b: 'Hal değişiminde sıcaklık sabit', f: ['hsT', 'hsY0'], m: ['Buz 0 °C\'ye kadar ısındı, sonra eriyene kadar sıcaklık <em>0 °C\'de kaldı</em>: verilen ısı tanecikler arası bağları koparmaya harcandı.', `${FM('Q = m · L')} · erime: 100 · 80 = <em>8000 cal</em>. Isınma: ${FM('Q = m · c · ΔT')}`] } },
    { sub: 'Isıtmaya devam.', go: '▶︎ Devam' },
    { do: S => { S.dur = QS[5]; S.kos = 1; }, sub: 'Su kaynıyor…', until: S => S.q >= QS[5] },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kaynama: en uzun düz bölüm', f: ['hsT', 'hsY1'], m: ['Kaynama ısısı 540 cal/g: aynı suyu 0\'dan 100 °C\'ye çıkarmanın 5 katından fazla ısı ister.', 'Basınç artarsa kaynama sıcaklığı yükselir (düdüklü tencere); suya tuz katılırsa donma sıcaklığı düşer (yollara tuz).'] } },
    { k: { tur: 'kavram', b: 'Öz ısı ve ısı sığası', m: [`Öz ısı (c): 1 g maddenin sıcaklığını 1 °C artırmak için gereken ısı — <em>ayırt edicidir</em>. Isı sığası: ${FM('C = m · c')} (madde miktarına bağlı).`, 'Aynı ısı verilirse ısı sığası küçük olanın sıcaklığı çok artar. Isı sığaları eşit iki farklı madde aynı ısıyla aynı miktar ısınır.'] } },
    { k: { tur: 'kavram', b: 'Kendi termometreni yap', m: ['X termometresinde buz 20 °X, su 120 °X\'te kaynıyor (100 bölme).', `${FM(`${F('X − 20', '120 − 20')} = ${F('C − 0', '100 − 0')}`)} → 50 °C = <em>70 °X</em>.`, 'Kural: (okunan − donma) / (kaynama − donma) her termometrede aynıdır.'] } },
    { do: S => Object.assign(S, { mod: 'bimetal', T: 20, isit: 0 }), k: { tur: 'kavram', b: 'Genleşme', f: ['hsA', 'hsB'], m: [`${FM('ΔL = L<sub>0</sub> · λ · ΔT')} · yüzey: ${FM('ΔA = A<sub>0</sub> · 2λ · ΔT')} · hacim: ${FM('ΔV = V<sub>0</sub> · 3λ · ΔT')}`, 'Bimetal şerit: genleşme katsayıları farklı iki metal yapıştırılmıştır.'] } },
    { p: { t: 'Pirinç (üstte) ve çelik (altta) şerit ısıtılırsa nasıl bükülür? (Pirincin genleşme katsayısı daha büyük.)', o: ['Yukarı, pirinç tarafına', 'Aşağı, çelik tarafına', 'Bükülmez, yalnız uzar', 'Önce yukarı sonra aşağı'], d: 1 } },
    { sub: 'Şeridi ısıtalım.', go: '▶︎ Isıt' },
    { do: S => { S.isit = 1; }, sub: 'Isınıyor…', wait: 3 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Çok uzayan dışta kalır', f: ['hsT'], m: ['Pirinç daha çok uzadı, şerit <em>çelik tarafına</em> büküldü (pirinç dış yayda). Ütü ve kombi termostatları, yangın alarmları böyle çalışır.'] } },
    { do: S => Object.assign(S, { mod: 'gol' }), k: { tur: 'gunluk', b: 'Göl neden tabana kadar donmaz?', f: ['hsT', 'hsK0'], m: ['Su 0–4 °C arasında ısınınca <em>büzülür</em>; en yoğun hali 4 °C\'dir. Soğuyan yüzey suyu 4 °C\'nin altına inince artık batmaz, yüzeyde kalıp donar.', 'Buz sudan hafiftir (0,92 g/cm³), yüzer ve alttaki suyu yalıtır: dipte 4 °C\'lik suda balıklar yaşar.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`Hal değişiminde T sabit: ${FM('Q = m L')} · ısınmada ${FM('Q = m c ΔT')} · ${FM('C = m c')}`, 'Bimetal çok uzayan metalin tersine bükülür · su 4 °C\'de en yoğun.'] } },
  ] });
  const gIs = gorev(sIs, { yk: 'TYT5-g5', no: 5, icon: '🧊', name: 'Isı laboratuvarı soruları', task: 'Isınma eğrisi, gizli ısı, X termometresi, ısıl denge, genleşme ve suyun 4 °C davranışı.', data: [['c<sub>su</sub>', '1 cal/g·°C'], ['c<sub>buz</sub>', '0,5 cal/g·°C'], ['L<sub>erime</sub>', '80 cal/g']], steps: [
    { do: S => egriK(S, QS[3]), sub: '100 g buz, −20 °C.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: '−20 °C\'deki 100 g buzun tamamını 0 °C\'de su yapmak için kaç kalori gerekir?', o: ['9000', '8000', '1000', '10000', '18000'], f: ['hsT'],
      s: ['Isınma: 100 · 0,5 · 20 = 1000 cal', 'Erime: 100 · 80 = 8000 cal', 'Toplam: <em>9000 cal</em> ✓'], n: ['Erime sırasında sıcaklık sabit kalır ama ısı alınmaya devam eder.', 'Buzun öz ısısı suyunkinin yarısıdır: aynı ısıyla iki kat ısınır.'] } },
    { q: { t: 'X termometresinde buz 10 °X\'te eriyor, su 160 °X\'te kaynıyor. 40 °C kaç °X\'tir?', o: ['70', '60', '50', '80', '140'],
      s: [`${F('X − 10', '160 − 10')} = ${F('40', '100')}`, `X − 10 = 150 · 0,4 = 60 → <em>X = 70 °X</em> ✓`], n: ['Her termometrede donma–kaynama arası orantı aynıdır.'] } },
    { q: { t: '80 °C\'deki 200 g su ile 20 °C\'deki 100 g su karıştırılıyor. Isı kaybı yoksa denge sıcaklığı kaç °C olur?', o: ['60', '50', '40', '70', '120'],
      s: [`§1. YOL`, 'Verilen = alınan: 200 · (80 − T) = 100 · (T − 20)', '16000 − 200T = 100T − 2000 → 300T = 18000 → <em>T = 60 °C</em> ✓', '§2. YOL', `Ağırlıklı ortalama: T = ${F('200 · 80 + 100 · 20', '200 + 100')} = <em>60 °C</em> ✓`], n: ['Aynı madde karışırsa denge sıcaklığı kütlelere göre ağırlıklı ortalamadır; kütlesi büyük olana yakın çıkar.'] } },
    { do: S => Object.assign(S, { mod: 'bimetal', T: 20, isit: 1 }), q: { t: 'Genleşme katsayısı λ<sub>K</sub> > λ<sub>L</sub> olan K ve L metallerinden yapılmış bimetal şerit soğutulursa hangi tarafa bükülür?', o: ['K tarafına', 'L tarafına', 'Bükülmez', 'Önce L sonra K tarafına'], f: ['hsA', 'hsB'],
      s: ['Soğuyunca K daha çok kısalır.', 'Çok kısalan iç yayda kalır: şerit <em>K tarafına</em> bükülür ✓'], n: ['Isıtınca tersi olur: çok uzayan (K) dış yayda kalır, şerit L tarafına bükülür.'] } },
    { do: S => Object.assign(S, { mod: 'gol' }), q: { t: 'Su 0 °C\'den 4 °C\'ye ısıtılıyor. Hangisi doğrudur?', o: ['Hacmi azalır, özkütlesi artar', 'Hacmi artar, özkütlesi azalır', 'Hacmi ve özkütlesi artar', 'Hiçbiri değişmez'], f: ['hsT'],
      s: ['0–4 °C arasında su ısınınca <em>büzülür</em>: hacim azalır.', 'Kütle sabit → özkütle artar ✓'], n: ['4 °C\'den sonra su da normal maddeler gibi ısınınca genleşir.'] } },
  ] });
  FZ.konuEk('TYT', 'Isı ve Sıcaklık', { dersler: [dIs], gorevler: [gIs] });

  // =====================================================================
  // ÇEMBERSEL HAREKET LABORATUVARI
  // =====================================================================
  const KF = 1.1 / 10;     // kuvvet ölçeği: mg = 10 birim → 1,1 (oranlar gerçek)
  const PARA = [0.1, 0.2, 0.3], MU = 0.4;            // paraların yarıçapı (m) · μ_s
  const RS = 7;                                       // 1 m = 7 birim (tabla)
  const sCm = sahne({ icon: '🎠', cam: [[0.6, 5, 9], [0.6, 0.6, 0]], plate: [11, 5, 0, 0], data: [['g', '10 m/s²']],
    cam2: S => S.mod === 'tumsek' ? [[2.2, 3.4, 14.5], [2.2, 1.4, 0]] : S.mod === 'konik' ? [[1.4, 5, 17], [1.4, 2.6, 0]] : [[0.6, 5, 9], [0.6, 0.6, 0]],
    S0: () => ({ mod: 'tabla', w: 0, kos: 0, ac: 0, kac: [0, 0, 0], kp: [null, null, null], kw: 2.5, ts: 0, vv: 10, don: 0 }),
    kur(g) {
      const G = {}; ['tabla', 'konik', 'tumsek'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      // döner tabla
      silindir(G.tabla, 0.25, 0.35, 0.5, 0x334155, -1.2, 0.25, 0); const tab = new THREE.Group(); tab.position.set(-1.2, 0.55, 0); G.tabla.add(tab);
      silindir(tab, 2.4, 2.4, 0.1, 0x7c3aed, 0, 0, 0, { edge: false }); kutu(tab, 2.3, 0.02, 0.06, 0xf5f3ff, 1.15, 0.06, 0, { edge: false });
      const para = PARA.map(() => { const p = silindir(G.tabla, 0.17, 0.17, 0.05, 0xd4a72c, 0, 0.63, 0); return p; });
      const of = PARA.map((_, i) => ok(0xdc2626, 'cmf' + i)), ov = PARA.map((_, i) => ok(0x111827, 'cmv' + i));
      // konik sarkaç
      kutu(G.konik, 0.3, 4.6, 0.3, 0x475569, -3, 2.3, 0); kutu(G.konik, 3.4, 0.2, 0.3, 0x475569, -1.4, 4.6, 0);
      const ip = duz(G.konik, 0x111827), kTop = top(G.konik, 0.2, 0xef4444, 0, 2, 0), oT = ok(0x0ea5e9, 'cmT'), oG = ok(0x475569, 'cmG'), oN = ok(0x16a34a, 'cmNet');
      // tümsek ve çukur
      const yol = duz(G.tumsek, 0x111827); const P = []; for (let i = 0; i <= 200; i++) { const x = -5 + i * 0.05; P.push(V3(x, yolY(x), 0)); } FZ.setLine(yol, P);
      const yolGovde = []; for (let i = 0; i < 100; i++) { const x = -5 + i * 0.1 + 0.05; yolGovde.push(kutu(G.tumsek, 0.11, 0.06, 1.2, 0x374151, x, yolY(x) - 0.03, 0, { edge: false })); yolGovde[i].rotation.z = Math.atan(yolE(x)); }
      const car = FZ.araba(G.tumsek, 0xef4444); car.scale.setScalar(0.45);
      const oN2 = ok(0x0ea5e9, 'cmN2'), oG2 = ok(0x475569, 'cmG2'), oV2 = ok(0x111827, 'cmV2');
      [['cmT', 'T (ip)', '#0284c7'], ['cmG', 'mg', '#475569'], ['cmNet', 'F<sub>net</sub> (merkezcil)', '#16a34a'], ['cmN2', 'N', '#0284c7'], ['cmG2', 'mg', '#475569'], ['cmV2', 'v', '#111827']].forEach(([id, h, c]) => etiket(id, h, c));
      PARA.forEach((_, i) => { etiket('cmf' + i, 'f<sub>s</sub>', '#dc2626'); etiket('cmv' + i, 'v', '#111827'); etiket('cmr' + i, `${PARA[i] * 100} cm`, '#7c3aed'); });
      kart('cmX', '', '#F5C400'); etiket('cmH', '', '#b45309');
      return { G, tab, para, of, ov, ip, kTop, oT, oG, oN, car, oN2, oG2, oV2 };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      [...o.of, ...o.ov, o.oT, o.oG, o.oN, o.oN2, o.oG2, o.oV2].forEach(a => a.visible = false);
      if (S.mod === 'tabla') {
        if (S.ac) S.w = Math.min(7, S.w + dt * 0.55); S.ang = (S.ang || 0) + S.w * dt;
        o.tab.rotation.y = S.ang; const c = V3(-1.2, 0.63, 0);
        PARA.forEach((r, i) => { const wm = Math.sqrt(MU * 10 / r), p = o.para[i];
          if (!S.kac[i] && S.w > wm) { S.kac[i] = 1; const a = S.ang; S.kp[i] = { p: c.clone().add(V3(Math.cos(a) * r * RS, 0, -Math.sin(a) * r * RS)), v: V3(-Math.sin(a), 0, -Math.cos(a)).multiplyScalar(S.w * r * RS) }; }
          if (S.kac[i]) { const k = S.kp[i]; if (k.p.distanceTo(c) < 4.5) k.p.add(k.v.clone().multiplyScalar(dt)); if (k.p.distanceTo(c) > 2.45) { k.vy = (k.vy || 0) + 10 * dt * 0.5; k.p.y = Math.max(0.03, k.p.y - k.vy * dt); }   /* tabladan çıkan para sabit ivmeyle (g) düşer; yatay hızı korunur */ p.position.copy(k.p); }
          else { const a = S.ang; p.position.set(c.x + Math.cos(a) * r * RS, 0.63, c.z - Math.sin(a) * r * RS);
            const f = r * S.w * S.w / 10;   // f / mg
            if (S.w > 0.05) { const ic = c.clone().sub(p.position).setY(0).normalize(); FZ.setArrow(o.of[i], p.position.clone().add(V3(0, 0.08, 0)), ic, Math.max(0.05, f * 1.1 * 2)); FZ.show('cmf' + i, p.position.clone().add(ic.multiplyScalar(f * 2.2 + 0.3)).add(V3(0, 0.3, 0)), 1); } }
          FZ.show('cmr' + i, V3(c.x + r * RS * 0.5 + 0.6, 0.3, 1.1 + i * 0), 0); });
        FZ.setTag('cmX', `ω = ${fs(S.w)} rad/s · sınır: 30 cm ${fs(Math.sqrt(4 / 0.3))} · 20 cm ${fs(Math.sqrt(4 / 0.2))} · 10 cm ${fs(Math.sqrt(4 / 0.1))}`); FZ.show('cmX', V3(0.2, 2.2, -2.6), 1);
      } else if (S.mod === 'konik') {
        const L = 3, w = S.kw, ct = Math.min(1, 10 / (w * w * L)), th = Math.acos(ct), r = L * Math.sin(th), h = L * ct, P0 = V3(0, 4.5, 0);
        S.ka = (S.ka || 0) + w * dt * 0.4;   // yavaş çekim: açısal konum 0,4 hızında
        const p = V3(Math.cos(S.ka) * r, 4.5 - h, Math.sin(S.ka) * r); o.kTop.position.copy(p); FZ.setLine(o.ip, [P0, p]);
        const Tm = 1 / ct;   // T / mg
        FZ.setArrow(o.oT, p, P0.clone().sub(p).normalize(), Tm * 1.1); FZ.setArrow(o.oG, p, V3(0, -1, 0), 1.1);
        const ic = V3(-p.x, 0, -p.z).normalize(); FZ.setArrow(o.oN, p, ic, Math.tan(th) * 1.1);
        FZ.show('cmT', p.clone().add(P0.clone().sub(p).normalize().multiplyScalar(Tm * 1.1 + 0.3)), 1); FZ.show('cmG', p.clone().add(V3(0.2, -1.4, 0)), 1); FZ.show('cmNet', p.clone().add(ic.multiplyScalar(Math.tan(th) * 1.1 + 0.6)), 1);
        FZ.setTag('cmX', `ω = ${fs(w)} rad/s · yavaş çekim`); FZ.show('cmX', V3(2.2, 5.6, 0), 1);
        FZ.setTag('cmH', `h = ${fs(h)} m`); FZ.show('cmH', V3(0.4, 4.5 - h / 2, 0), 1);
      } else {
        // tümsek (x = −2,5) ve çukur (x = 2,5); R = 20 m, m = 1000 kg, araba v hızıyla — duraklarda görüntü dondurulur
        if (S.kos) { S.ts += dt * S.vv * 0.05; if (S.dur != null && S.ts >= S.dur) { S.ts = S.dur; S.kos = 0; } }
        const x = -4.6 + S.ts, y = yolY(x), e = Math.atan(yolE(x));
        o.car.position.set(x, y, 0); o.car.rotation.z = e;
        const R = 20, m = 1000, v = S.vv, mg = m * 10, ust = Math.abs(x + 2.5) < 0.05, alt = Math.abs(x - 2.5) < 0.05;
        if (ust || alt) { const N = ust ? mg - m * v * v / R : mg + m * v * v / R, c = V3(x, y + 0.35, 0.5);
          FZ.setArrow(o.oG2, c, V3(0, -1, 0), mg / 10000 * 1.2); FZ.show('cmG2', c.clone().add(V3(0.45, -0.9, 0)), 1);
          if (N > 0) { FZ.setArrow(o.oN2, V3(x - 0.15, y, 0.5), V3(0, 1, 0), N / 10000 * 1.2); FZ.show('cmN2', V3(x - 0.15, y + N / 10000 * 1.2 + 0.35, 0.5), 1); }
          FZ.setArrow(o.oV2, V3(x, y + 0.85, 0), V3(1, 0, 0), 0.9); FZ.show('cmV2', V3(x + 1.1, y + 0.85, 0), 1);
          FZ.setTag('cmX', `${ust ? 'Tümsek tepesi' : 'Çukur dibi'} · görüntü donduruldu · N = ${Math.round(N / 100) / 10} kN, mg = 10 kN`); }
        else FZ.setTag('cmX', `v = ${v} m/s · R = 20 m · m = 1000 kg`);
        FZ.show('cmX', V3(1.2, 3.6, 0), 1);
      }
    },
    qp: () => V3(0.6, 3.8, 0) });
  function yolY(x) { return x < -4 ? 0.8 : x < -1 ? 0.8 + 0.9 * Math.cos((x + 2.5) / 1.5 * Math.PI / 2) ** 2 * (Math.abs(x + 2.5) < 1.5 ? 1 : 0) : x < 1 ? 0.8 : x < 4 ? 0.8 - 0.6 * Math.cos((x - 2.5) / 1.5 * Math.PI / 2) ** 2 * (Math.abs(x - 2.5) < 1.5 ? 1 : 0) : 0.8; }
  function yolE(x) { const h = 0.01; return (yolY(x + h) - yolY(x - h)) / (2 * h); }
  const tablaK = S => Object.assign(S, { mod: 'tabla', w: 0, ac: 0, ang: 0, kac: [0, 0, 0], kp: [null, null, null] });
  const tumK = (S, vv) => Object.assign(S, { mod: 'tumsek', vv, ts: 0, kos: 0, dur: null });

  const dCm = ders(sCm, { yk: 'AYT16-d5', no: 5, icon: '🎠', name: 'Çembersel hareket laboratuvarı', task: 'Döner tablada hangi para önce kayar, konik sarkaç, viraj, tümsek ve çukurda tepki kuvveti.', steps: [
    { do: tablaK, k: { tur: 'merak', b: 'Döner tabla hızlandıkça hangi para önce fırlar?', m: ['Merkezden 10, 20 ve 30 cm uzaktaki özdeş paralar (μ<sub>s</sub> = 0,4). Tablanın açısal hızı yavaş yavaş artırılacak.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Merkezcil kuvveti kim sağlıyor?', f: ['cmf0', 'cmf1', 'cmf2'], m: ['Parayı çembersel yörüngede tutan, tabla ile para arasındaki <em>statik sürtünme</em>dir; yönü <em>merkeze doğrudur</em>.', `${FM('f = m ω<sup>2</sup> r')} · sürtünme en çok ${FM('μ m g')} olabilir → ${FM(`ω<sub>max</sub> = ${SQ(F('μ g', 'r'))}`)}`] } },
    { p: { t: 'Tablanın açısal hızı yavaşça artırılırsa önce hangi para kayar?', o: ['10 cm\'deki', '30 cm\'deki', 'Hepsi aynı anda', 'Hiçbiri kaymaz'], d: 1 } },
    { sub: 'Tablayı döndürelim.', go: '▶︎ Döndür' },
    { do: S => { S.ac = 1; }, sub: 'ω artıyor…', until: S => S.kac[1] === 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Merkezden uzak olan önce kayar', f: ['cmX'], m: ['r büyükse gereken merkezcil kuvvet (mω²r) büyük; sürtünme sınırı herkese aynı (μmg). 30 cm\'deki önce, sonra 20 cm\'deki kaydı.', 'Kayan para <em>hızının yönünde (teğet)</em> gider; merkezden "dışarı itilmez".'] } },
    { do: S => Object.assign(S, { mod: 'konik', kw: 2.5 }), k: { tur: 'kavram', b: 'Konik sarkaç', f: ['cmT', 'cmG', 'cmNet'], m: ['İp gerilmesinin düşey bileşeni ağırlığı dengeler, yatay bileşeni merkezcil kuvveti sağlar. Bileşke kuvvet <em>yatay, merkeze doğru</em>.', `${FM(`tanθ = ${F('ω<sup>2</sup> r', 'g')}`)} · askı noktasının altındaki yükseklik ${FM(`h = ${F('g', 'ω<sup>2</sup>')}`)} (kütle ve ip boyundan bağımsız).`] } },
    { x: { b: 'Açısal hızı değiştir', m: ['ω artınca top yükselir (h azalır).'],
      kay: [{ ad: 'kw', etiket: 'ω', min: 2, max: 5, adim: 0.5, deger: 2.5, birim: 'rad/s', set: (S, v) => { S.kw = v; } }],
      olc: S => `h = ${F('10', `${fs(S._kw)}<sup>2</sup>`)} = <em>${fs(10 / (S._kw * S._kw))} m</em>` } },
    { do: S => tumK(S, 10), k: { tur: 'kavram', b: 'Tümsek ve çukur', m: ['Tümseğin tepesinde merkez <em>aşağıda</em>: mg − N = mv²/R → N < mg (araba hafifler).', 'Çukurun dibinde merkez <em>yukarıda</em>: N − mg = mv²/R → N > mg (araba ağırlaşır).'] } },
    { p: { t: '1000 kg araba R = 20 m tümseğin tepesinden v = 10 m/s ile geçiyor. Yolun tepki kuvveti kaç kN olur?', o: ['10', '5', '15', '0'], d: 1 } },
    { sub: 'Arabayı sürelim.', go: '▶︎ Sür' },
    { do: S => { S.dur = 2.1; S.kos = 1; }, sub: 'Tümsek…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Tepede N < mg', f: ['cmN2', 'cmG2'], m: [`N = mg − ${F('mv<sup>2</sup>', 'R')} = 10000 − 5000 = <em>5 kN</em> (oklar gerçek oranlı).`, `v = ${SQ('gR')} = ${SQ('200')} ≈ 14 m/s\'yi aşarsa N sıfır olur ve araba yoldan ayrılır.`] } },
    { sub: 'Çukura devam.', go: '▶︎ Sür' },
    { do: S => { S.dur = 7.1; S.kos = 1; }, sub: 'Çukur…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Dipte N > mg', f: ['cmN2', 'cmG2'], m: [`N = mg + ${F('mv<sup>2</sup>', 'R')} = 10000 + 5000 = <em>15 kN</em>.`, 'Dikkat: N ile mg etki–tepki çifti değildir; ikisi de arabaya etki eder ve eşit olmaları gerekmez.'] } },
    { k: { tur: 'kavram', b: 'Viraj', m: [`Düz virajda merkezcil kuvveti sürtünme sağlar: ${FM(`v<sub>max</sub> = ${SQ('μ g r')}`)} (kuru yol μ ≈ 0,8, ıslak 0,5, buzlu 0,1).`, `Eğimli virajda sürtünmesiz güvenli hız: ${FM(`v = ${SQ('r g tanθ')}`)}`] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`F<sub>m</sub> = ${F('mv<sup>2</sup>', 'r')} = mω<sup>2</sup>r`)} · merkezcil kuvvet ayrı bir kuvvet değil; sürtünme, ip gerilmesi, N ve mg\'nin bileşkesidir.`, 'Tabla: uzaktaki önce kayar · konik sarkaç h = g/ω² · tümsek N < mg, çukur N > mg.'] } },
  ] });
  const gCm = gorev(sCm, { yk: 'AYT16-g6', no: 6, icon: '🎠', name: 'Çembersel hareket laboratuvarı soruları', task: 'Döner tabla, konik sarkaç, viraj, tümsek ve çukur.', data: [['g', '10 m/s²']], steps: [
    { do: tablaK, sub: 'Döner tabla: 10, 20, 30 cm\'deki paralar, μ = 0,4.', go: '▶︎ Başlat' },
    { do: S => { S.ac = 1; }, q: { t: 'Merkezden 40 cm uzaktaki para ile tabla arasında μ<sub>s</sub> = 0,4. Para kaymadan tabla en çok kaç rad/s açısal hızla dönebilir?', o: [SQ('10'), '10', '2', '4'], f: ['cmX'],
      s: [`μ m g = m ω<sup>2</sup> r → ω = ${SQ(F('μ g', 'r'))} = ${SQ(F('0,4 · 10', '0,4'))} = <em>${SQ('10')} rad/s</em> ✓`], n: ['Sınır açısal hız kütleden bağımsızdır; yalnız μ, g ve r\'ye bağlıdır.', 'Merkezcil kuvveti statik sürtünme sağlar ve merkeze doğrudur.'] } },
    { do: S => Object.assign(S, { mod: 'konik', kw: 2 }), q: { t: 'Konik sarkaç ω = 2 rad/s açısal hızla dönüyor. Top askı noktasının kaç m altında döner?', o: ['2,5', '5', '1,25', '10', '7,5'], f: ['cmH'],
      s: [`h = ${F('g', 'ω<sup>2</sup>')} = ${F('10', '4')} = <em>2,5 m</em> ✓`], n: ['Bileşke kuvvet yataydır ve merkeze doğrudur; ip gerilmesinin düşey bileşeni mg\'yi dengeler.'] } },
    { do: S => { tumK(S, 10); S.ts = 2.1; }, q: { t: '800 kg\'lık araba yarıçapı 40 m olan tümseğin tepesinden 10 m/s ile geçiyor. Yolun tepki kuvveti kaç N\'dur?', o: ['6000', '8000', '10000', '2000', '12000'], f: ['cmN2', 'cmG2'],
      s: [`N = mg − ${F('mv<sup>2</sup>', 'R')} = 8000 − ${F('800 · 100', '40')} = 8000 − 2000 = <em>6000 N</em> ✓`], n: ['Tepede merkez aşağıda olduğundan bileşke kuvvet aşağı doğrudur: mg > N.'] } },
    { do: S => { tumK(S, 10); S.ts = 7.1; }, q: { t: 'Aynı araba yarıçapı 40 m olan çukurun dibinden 20 m/s ile geçiyor. Tepki kuvveti ağırlığının kaç katıdır?', o: ['2', '1,5', '3', '1', '4'], f: ['cmN2', 'cmG2'],
      s: [`N = mg + ${F('mv<sup>2</sup>', 'R')} = 8000 + ${F('800 · 400', '40')} = 16000 N`, `${F('16000', '8000')} = <em>2 katı</em> ✓`], n: ['Çukurda yolcu kendini ağırlaşmış hisseder; ağırlığı (mg) değişmez, artan tepki kuvvetidir.'] } },
    { q: { t: 'Yarıçapı 50 m olan düz virajda lastik–yol sürtünme katsayısı 0,5. Kaymadan alınabilecek en büyük hız kaç m/s\'dir?', o: ['5' + SQ('10'), '25', '10', '50'],
      s: [`μ m g = ${F('m v<sup>2</sup>', 'r')} → v = ${SQ('μ g r')} = ${SQ('0,5 · 10 · 50')} = ${SQ('250')} = <em>5${SQ('10')} m/s</em> ✓`], n: ['Yol ıslanınca μ küçülür ve güvenli hız düşer.'] } },
  ] });
  FZ.konuEk('AYT', 'Çembersel Hareket', { dersler: [dCm], gorevler: [gCm] });
})();
