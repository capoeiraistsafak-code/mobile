// Kitap düzeninde HİKÂYE MODU + SORU SİSTEMİ · TYT Isı ve Sıcaklık · Genleşme
// Sorular özgündür; kitaplardaki soru TİPLERİ örnek alınmıştır.
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');
  const SIVI = (renk = 0x3b82f6, op = 0.6) => new THREE.MeshLambertMaterial({ color: renk, transparent: true, opacity: op, depthWrite: false });
  const CAM = () => new THREE.MeshPhongMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.22, shininess: 100, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false });
  // Termometre: cam boru + hazne + kırmızı sıvı; a.ayarla(oran 0..1)
  const termometre = (g, x, z, boy = 1.8, et = null) => { const a = new THREE.Group(); a.position.set(x, 0, z); g.add(a);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, boy, 10), CAM()); c.position.y = boy / 2 + 0.15; a.add(c);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshLambertMaterial({ color: 0xdc2626 })); h.position.y = 0.12; a.add(h);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 8), new THREE.MeshLambertMaterial({ color: 0xdc2626 })); a.add(s);
    for (let i = 0; i <= 10; i++) kutu(a, 0.1, 0.012, 0.01, 0x111827, 0.1, 0.25 + i * (boy - 0.2) / 10, 0.05, { edge: false });
    if (et) et.forEach(([k, t]) => FZ.yazi(a, t, 0.45, 0.2 + 0.05 + k * (boy - 0.2), 0.06, 0.22));
    a.ayarla = k => { const L = 0.05 + Math.max(0, Math.min(1, k)) * (boy - 0.2); s.scale.y = L; s.position.y = 0.2 + L / 2; }; a.boy = boy; return a; };
  const tencere = (g, x, m) => { const a = new THREE.Group(); a.position.set(x, 0.5, 0); g.add(a);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.55, 0.9, 24, 1, true), FZ.metal(0x9ca3af)); d.material.side = THREE.DoubleSide; d.position.y = 0.45; a.add(d);
    const t = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), FZ.metal(0x6b7280)); t.rotation.x = -Math.PI / 2; t.position.y = 0.01; a.add(t);
    [-1, 1].forEach(s => { const k = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI), new THREE.MeshLambertMaterial({ color: 0x111827 })); k.position.set(s * 0.66, 0.75, 0); k.rotation.z = s * Math.PI / 2; a.add(k); });
    const su = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.55, 1, 24), SIVI()); a.add(su); a.su = su; a.m = m;
    a.seviye = m => { const h = 0.22 * m; su.scale.y = h; su.position.y = h / 2 + 0.01; }; a.seviye(m); return a; };

  // TOK: madde – öz ısı tablosu (cal/g·°C)
  const C = { su: 1, buz: 0.5, demir: 0.11, bakir: 0.09, aluminyum: 0.22 };
  const sIs = sahne({ icon: '🌡️', cam: [[2.3, 3.4, 11], [2.3, 1.3, 0]], plate: [12, 5, 0, 0], data: [['Suyun öz ısısı', '1 cal/g·°C'], ['Buzun erime ısısı', '80 cal/g']],
    cam2: S => ({ tencere: [[2.3, 3.4, 11], [2.3, 1.3, 0]], karisim: [[2.1, 3.2, 10], [2.1, 1.3, 0]], termo: [[2.1, 3, 9.5], [2.1, 1.6, 0]], halka: [[2.2, 3.2, 9.5], [2.2, 1.6, 0]], ray: [[2.2, 3.4, 9], [2.2, 0.6, 0]] })[S.mod],
    S0: () => ({ mod: 'tencere', ms: [1, 2, 3], T0: [20, 20, 20], T: [20, 20, 20], cs: [1, 1, 1], kos: 0, Q: 0, mk: [200, 100], Tk: [80, 20], kar: 0, Tx: [20, 120], Ty: [-10, 140], Tc: 40, isi: 0, kh: 0, gun: 0 }),
    kur(g) {
      const G = {}; ['tencere', 'karisim', 'termo', 'halka', 'ray'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      const oc = [-2.4, 0, 2.4].map(x => { const o = FZ.ocak(G.tencere, 1); o.position.x = x; return o; });
      const tn = [-2.4, 0, 2.4].map((x, i) => tencere(G.tencere, x, i + 1));
      const tm = [-2.4, 0, 2.4].map(x => { const t = termometre(G.tencere, x + 0.25, 0.1, 1.5, [[0, '0'], [0.5, '50'], [1, '100°C']]); t.position.y = 0.6; return t; });
      // karışım: iki beher → kalorimetre
      const bh = [-1.6, 1.6].map((x, i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.2, 24, 1, true), CAM()); c.position.set(x, 0.62, 0); G.karisim.add(c); const s = silindir(G.karisim, 0.5, 0.47, 1, i ? 0x60a5fa : 0xef4444, x, 0.5, 0, { op: 0.6, edge: false }); return s; });
      const kal = new THREE.Group(); kal.position.set(0, 0, -1.3); G.karisim.add(kal);
      const kd = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.4, 28, 1, true), FZ.metal(0xd1d5db)); kd.material.side = THREE.DoubleSide; kd.position.y = 0.7; kal.add(kd);
      const kks = silindir(kal, 0.75, 0.75, 1, 0x8b5cf6, 0, 0.5, 0, { op: 0.65, edge: false });
      const ktm = termometre(G.karisim, 0.35, -1.3, 2); ktm.position.y = 0.5;
      // termometreler: X, Celsius, Y
      const tt = [[-1.6, ['20', '120 °X']], [0, ['0', '100 °C']], [1.6, ['−10', '140 °Y']]].map(([x, e]) => termometre(G.termo, x, 0, 2.6, [[0.1, e[0]], [0.9, e[1]]]));
      // halka–küre ve delikli levha
      const halka = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 10, 32), FZ.metal(0xb45309)); halka.rotation.x = Math.PI / 2; halka.position.set(-1.2, 2, 0); G.halka.add(halka);
      kutu(G.halka, 0.08, 2, 0.08, 0x374151, -1.8, 1, 0); kutu(G.halka, 0.6, 0.06, 0.06, 0x374151, -1.5, 2, 0);
      const kure = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), FZ.metal(0x9ca3af)); kure.position.set(-1.2, 2.55, 0); G.halka.add(kure);
      const hal = FZ.ocak(G.halka, 0.7); hal.position.set(-1.2, 0, 0);
      const lev = new THREE.Mesh(new THREE.RingGeometry(0.35, 1, 40), FZ.metal(0x9ca3af)); lev.material.side = THREE.DoubleSide; lev.position.set(1.6, 1.6, 0); G.halka.add(lev);
      // raylar
      const ray = [-1.55, 1.55].map(x => { const r = kutu(G.ray, 3, 0.18, 0.12, 0x6b7280, x, 0.3, 0); r.material = FZ.metal(0x6b7280); return r; });
      for (let i = 0; i < 12; i++) kutu(G.ray, 0.18, 0.1, 1, 0x78350f, -2.9 + i * 0.52, 0.12, 0);
      const gunes = top(G.ray, 0.35, 0xfacc15, 2.6, 3, -1, { edge: false });
      ['k2a', 'k2b', 'k2c', 'k2d'].forEach(i => etiket(i, '', '#1e3a8a')); kart('k2K', '', '#F5C400');
      return { G, oc, tn, tm, bh, kks, ktm, tt, halka, kure, lev, ray, gunes };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      const L = ['k2a', 'k2b', 'k2c'];
      if (S.mod === 'tencere') {
        if (S.kos) { S.Q = Math.min(S.Qmax || 6000, S.Q + dt * 1500); if (S.Q >= (S.Qmax || 6000)) S.kos = 0; }
        for (let i = 0; i < 3; i++) { o.tn[i].seviye(S.ms[i]); S.T[i] = S.T0[i] + S.Q / (S.ms[i] * 100 * S.cs[i]); o.tm[i].ayarla(S.T[i] / 100); o.oc[i].alev.visible = !!S.kos;
          FZ.setTag(L[i], `${['K', 'L', 'M'][i]}: ${S.ms[i] * 100} g · ${fs(S.T[i])} °C`); FZ.show(L[i], V3([-2.4, 0, 2.4][i], 2.6, 0), 1); }
        FZ.setTag('k2K', `Eşit güçlü ocaklar · her birine verilen ısı Q = ${Math.round(S.Q)} cal`); FZ.show('k2K', V3(0, 3.4, 0), 1);
      } else if (S.mod === 'karisim') {
        const [m1, m2] = S.mk, [T1, T2] = S.Tk, Td = (m1 * T1 + m2 * T2) / (m1 + m2);
        if (S.kos) { S.kar = Math.min(1, S.kar + dt * 0.4); if (S.kar >= 1) S.kos = 0; }
        o.bh.forEach((b, i) => { const f = 1 - S.kar; b.scale.y = Math.max(0.01, f * S.mk[i] / 200); b.position.y = 0.02 + b.scale.y / 2; });
        const Tn = S.kar < 1 ? (T1 + T2) / 2 + (Td - (T1 + T2) / 2) * S.kar : Td; o.kks.scale.y = Math.max(0.01, S.kar * (m1 + m2) / 300); o.kks.position.y = o.kks.scale.y / 2 + 0.02;
        o.kks.material.color.setRGB(0.4 + 0.5 * Tn / 100, 0.3, 1 - 0.6 * Tn / 100); o.ktm.ayarla(Tn / 100);
        FZ.setTag('k2a', `${m1} g · ${T1} °C`); FZ.show('k2a', V3(-1.6, 1.6, 0), 1); FZ.setTag('k2b', `${m2} g · ${T2} °C`); FZ.show('k2b', V3(1.6, 1.6, 0), 1);
        FZ.setTag('k2c', S.kar >= 1 ? `Denge: ${fs(Td)} °C` : '…'); FZ.show('k2c', V3(0, 2.7, -1.3), 1);
        FZ.setTag('k2K', 'Isı kaybı yok: verilen ısı = alınan ısı'); FZ.show('k2K', V3(0, 3.6, 0), 1);
      } else if (S.mod === 'termo') {
        const k = (S.Tc - 0) / 100; const kx = S.Tx[0] + k * (S.Tx[1] - S.Tx[0]), ky = S.Ty[0] + k * (S.Ty[1] - S.Ty[0]);
        o.tt.forEach(t => t.ayarla(0.1 + 0.8 * k));
        [[`X: ${fs(kx)} °X`, -1.6], [`${S.Tc} °C`, 0], [`Y: ${fs(ky)} °Y`, 1.6]].forEach(([h, x], i) => { FZ.setTag(L[i], h); FZ.show(L[i], V3(x, 3.2, 0), 1); });
        FZ.setTag('k2K', `X: buz ${S.Tx[0]}, kaynama ${S.Tx[1]} · Y: buz ${S.Ty[0]}, kaynama ${S.Ty[1]}`); FZ.show('k2K', V3(0, 3.9, 0), 1);
      } else if (S.mod === 'halka') {
        if (S.kos) { S.isi = Math.min(1, S.isi + dt * 0.3); if (S.isi >= 1) S.kos = 0; }
        const k = 1 + 0.12 * S.isi; o.halka.scale.set(k, k, 1); o.halka.material.color.setRGB(0.7 + 0.3 * S.isi, 0.35, 0.04);
        const gecer = 0.5 * k - 0.1 > 0.5 - 0.005; o.kure.position.y = gecer ? Math.max(1.0, o.kure.position.y - dt * 1.2) : 2.55;
        o.lev.scale.setScalar(1 + 0.12 * S.isi); o.lev.material.color.setRGB(0.6 + 0.4 * S.isi, 0.6 - 0.2 * S.isi, 0.6 - 0.4 * S.isi);
        FZ.setTag('k2a', gecer ? 'Halka genişledi: küre geçti' : 'Küre halkadan geçemiyor'); FZ.show('k2a', V3(-1.2, 3.4, 0), 1);
        FZ.setTag('k2b', `Delik yarıçapı ×${fs(1 + 0.12 * S.isi)}`); FZ.show('k2b', V3(1.6, 3, 0), 1);
      } else {
        const T = S.gun ? 45 : 5, bos = 0.24 - (T - 5) / 40 * 0.2; o.ray[0].position.x = -1.5 - bos / 2; o.ray[1].position.x = 1.5 + bos / 2; o.gunes.visible = !!S.gun;
        FZ.setTag('k2a', `T = ${T} °C · boşluk ${fs(bos * 10)} mm`); FZ.show('k2a', V3(0, 1.2, 0.3), 1);
        FZ.setTag('k2K', 'ΔL = L<sub>0</sub> · λ · ΔT'); FZ.show('k2K', V3(0, 2.4, 0), 1);
      }
    },
    qp: () => V3(0, 3.6, 0) });
  const md = (S, mod, x) => Object.assign(S, { mod, kos: 0 }, x || {});

  const h1 = ders(sIs, { yk: 'TYT5-d4', no: 4, icon: '📖', name: 'Hikâye: Üç tencere, bir termos ve uydurma termometre', task: 'Isı–sıcaklık, öz ısı ve ısı sığası, sıcaklık değişimi, ısıl denge, termometre dönüşümleri.', notlar: ['Isı enerjidir (cal, J); sıcaklık ise ortalama kinetik enerjinin göstergesidir (°C, K).', 'Q = m · c · ΔT · ısı sığası C = m · c.', 'Isı alışverişinde verilen ısı = alınan ısı; ısı akışı sıcaklıklar eşitlenince durur.'], steps: [
    { do: S => md(S, 'tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 }), sub: 'Ece annesine yardım ediyor: ocakta 100 g, 200 g ve 300 g su olan üç tencere var. Üç ocak eşit güçte.', go: '▶︎ Ocakları yak' },
    { do: S => { S.Qmax = 6000; S.kos = 1; }, sub: 'Üç tencereye de eşit sürede eşit ısı veriliyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', b: 'Aynı ısı, farklı sıcaklık artışı', f: ['k2a', 'k2b', 'k2c'], m: ['Her tencere 6000 cal aldı ama K 60 °C, L 30 °C, M 20 °C ısındı.', `${FM('Q = m · c · ΔT')} → ${FM(`ΔT = ${F('Q', 'm · c')}`)} · kütle büyükse sıcaklık az artar.`] } },
    { k: { tur: 'kavram', b: 'Isı ile sıcaklık farklıdır', m: ['<em>Isı</em>: sıcaklık farkı yüzünden aktarılan enerji (kalori, joule). Kalorimetre kabıyla dolaylı ölçülür.', '<em>Sıcaklık</em>: taneciklerin ortalama hareket enerjisinin göstergesi; termometreyle ölçülür.', '1 cal: 1 g suyun sıcaklığını 1 °C artıran ısı ≈ 4,18 J.'] } },
    { do: S => md(S, 'tencere', { ms: [2, 2, 2], cs: [1, 0.5, 0.25], T0: [20, 20, 20], Q: 0 }), sub: 'Annesi üç tencereye eşit kütlede farklı sıvılar koydu: su, zeytinyağı ve özel bir yağ.', go: '▶︎ Isıt' },
    { do: S => { S.Qmax = 3000; S.kos = 1; }, sub: 'Isınıyor…', until: S => !S.kos },
    { k: { tur: 'kavram', b: 'Öz ısı ve ısı sığası', f: ['k2a', 'k2b', 'k2c'], m: ['Öz ısısı (c) küçük olan madde aynı ısıyla daha çok ısınır: K 15, L 30, M 60 °C arttı.', `Öz ısı maddeyi tanıtır (ayırt edicidir). Isı sığası: ${FM('C = m · c')} · madde miktarına bağlıdır.`, 'Neden su yavaş ısınır? Öz ısısı büyüktür (1 cal/g·°C). Bu yüzden deniz kenarında sıcaklık farkı azdır.'] } },
    { do: S => md(S, 'karisim', { mk: [200, 100], Tk: [80, 20], kar: 0 }), sub: 'Ece 80 °C\'deki 200 g suyu, 20 °C\'deki 100 g suyla bir termos kabında karıştırıyor.', go: '▶︎ Karıştır' },
    { p: { t: 'Karışımın denge sıcaklığı nasıl olur?', o: ['50 °C (ortalama)', '60 °C', '40 °C', '80 °C'], d: 1 } },
    { do: S => { S.kos = 1; }, sub: 'Sıcak su ısı veriyor, soğuk su alıyor…', until: S => S.kar >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Isıl denge', f: ['k2c'], m: [`${FM('Q<sub>verilen</sub> = Q<sub>alınan</sub>')}: 200 · 1 · (80 − T) = 100 · 1 · (T − 20) → <em>T = 60 °C</em>`, 'Denge sıcaklığı ısı sığası büyük olana (200 g) daha yakındır. Ortalama ancak ısı sığaları eşitse doğrudur.'] } },
    { k: { tur: 'dikkat', b: 'UYARI', m: ['Isı her zaman sıcaklığı yüksek olandan düşük olana akar; iç enerjisi büyük olandan değil.', 'Isı alan cismin sıcaklığı her zaman artmaz: hal değişirken sabit kalır (Q = m · L).'] } },
    { do: S => md(S, 'termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 40 }), sub: 'Ece kendi termometresini yaptı: buz eriyorken 20, su kaynarken 120 gösteriyor (X). Arkadaşınınki −10 ve 140 (Y).', wait: 2 },
    { k: { tur: 'kavram', b: 'Termometre dönüşümü', f: ['k2a', 'k2b', 'k2c'], m: [`${FM(`${F('X − X<sub>donma</sub>', 'X<sub>kaynama</sub> − X<sub>donma</sub>')} = ${F('C − 0', '100 − 0')}`)}`, '40 °C → X: 20 + 0,4 · 100 = <em>60 °X</em> · Y: −10 + 0,4 · 150 = <em>50 °Y</em>.', 'Neden? Bütün termometrelerde donma–kaynama arası aynı oranla bölünür; yalnız bölme sayıları farklıdır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('Q = m c ΔT')} · ${FM('C = m c')} · ${FM('Q<sub>verilen</sub> = Q<sub>alınan</sub>')}`, 'Termometreler: (okunan − donma) / (kaynama − donma) hep aynı.'] } },
  ] });
  const h2 = ders(sIs, { yk: 'TYT5-d5', no: 5, icon: '📖', name: 'Hikâye: Halkadan geçmeyen küre ve yazın uzayan raylar', task: 'Boyca, yüzeyce ve hacimce genleşme, delik ve halka genleşmesi, genleşme katsayısı, bimetal, günlük hayat.', notlar: ['ΔL = L₀ · λ · ΔT · ΔA = A₀ · 2λ · ΔT · ΔV = V₀ · 3λ · ΔT', 'Isınan levhadaki delik de levha gibi büyür.', 'Genleşme katsayısı (λ) ayırt edicidir.'], steps: [
    { do: S => md(S, 'halka', { isi: 0 }), sub: 'Okul laboratuvarında öğretmen bakır bir halkanın üstüne metal bir küre koydu. Küre halkadan geçemiyor.', go: '▶︎ Halkayı ısıt' },
    { p: { t: 'Yalnız halka ısıtılırsa ne olur?', o: ['Halka büzülür, küre hiç geçmez', 'Halka genişler, küre geçer', 'Değişmez', 'Küre büyür'], d: 1 } },
    { do: S => { S.kos = 1; }, sub: 'Halka ısınıyor…', until: S => S.isi >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Isınan halka her yöne genleşir', f: ['k2a', 'k2b'], m: ['Halkanın iç çapı da büyüdü, küre geçti. Delikli levhada da delik <em>büyür</em>: delik, levhanın "eksik parçası" gibi genleşir.', 'Neden? Isınan maddenin tanecikleri daha hızlı titreşip birbirinden uzaklaşır.'] } },
    { k: { tur: 'kavram', b: 'Genleşme formülleri', m: [`${FM('ΔL = L<sub>0</sub> · λ · ΔT')} boyca · ${FM('ΔA = A<sub>0</sub> · 2λ · ΔT')} yüzeyce · ${FM('ΔV = V<sub>0</sub> · 3λ · ΔT')} hacimce`, 'λ: genleşme katsayısı, maddeyi tanıtır. Uzama ilk boyla ve sıcaklık değişimiyle doğru orantılıdır.'] } },
    { do: S => md(S, 'ray', { gun: 0 }), sub: 'Ece trenle köyüne gidiyor. Kışın raylar arasında boşluk var.', go: '▶︎ Yaz gelsin' },
    { do: S => { S.gun = 1; }, sub: 'Yazın güneşte raylar ısınıyor…', wait: 2.5 },
    { k: { tur: 'gunluk', b: 'Genleşme günlük hayatta', f: ['k2a'], m: ['Ray ve köprü derzlerinde boşluk bırakılır; elektrik telleri yazın sarkar.', 'Sıkışan kavanoz kapağı sıcak suya tutulunca açılır (metal camdan çok genleşir). Bimetal şeritler termostatlarda kullanılır.'] } },
    { k: { tur: 'dikkat', b: 'Suyun farklı davranışı', m: ['Su 0 °C\'den 4 °C\'ye ısınırken <em>büzülür</em>; 4 °C\'de özkütlesi en büyüktür. Göller bu yüzden yüzeyden donar.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Isınan cisim ve içindeki delik büyür · ΔL ∝ L<sub>0</sub>, λ, ΔT · su 0–4 °C arası istisna.'] } },
  ] });

  const g1 = gorev(sIs, { yk: 'TYT5-g6', no: 6, icon: '🧪', name: 'Soru sistemi: ısı, sıcaklık, ısıl denge, termometre', task: 'Eşit ısı alan kaplar, öz ısı tablosu, ısıl denge, buz–su, termometre dönüşümü, ısı iletimi.', data: [['Suyun öz ısısı', '1 cal/g·°C'], ['Buzun öz ısısı', '0,5 cal/g·°C'], ['Buzun erime ısısı', '80 cal/g']], steps: [
    { do: S => md(S, 'tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 }), sub: 'Eşit güçlü üç ocak.', go: '▶︎ Başlat' },
    { do: S => { S.Qmax = 6000; S.kos = 1; }, q: { t: 'K, L, M kaplarında 20 °C\'de sırasıyla 100 g, 200 g ve 300 g su vardır. Eşit güçlü ocaklarda eşit süre ısıtılıyor. Son sıcaklıklar T<sub>K</sub>, T<sub>L</sub>, T<sub>M</sub> arasındaki ilişki nedir? (Kaynama olmuyor)', o: ['T<sub>K</sub> > T<sub>L</sub> > T<sub>M</sub>', 'T<sub>K</sub> = T<sub>L</sub> = T<sub>M</sub>', 'T<sub>M</sub> > T<sub>L</sub> > T<sub>K</sub>', 'T<sub>L</sub> > T<sub>K</sub> > T<sub>M</sub>'], f: ['k2a', 'k2b', 'k2c'],
      s: ['Eşit ısı: Q aynı → ΔT = Q / (m c), m büyüdükçe ΔT küçük.', '<em>T<sub>K</sub> > T<sub>L</sub> > T<sub>M</sub></em> ✓'], n: ['Isı sığası büyük olan daha yavaş ısınır.'] } },
    { q: { t: 'Aynı kaplarda K\'deki su 6000 cal aldıysa sıcaklığı kaç °C\'ye çıkar?', o: ['80', '60', '70', '100'], f: ['k2a'],
      s: [`ΔT = ${F('6000', '100 · 1')} = 60 °C`, 'T = 20 + 60 = <em>80 °C</em> ✓'], n: ['Son sıcaklık = ilk sıcaklık + ΔT.'] } },
    { do: S => md(S, 'tencere', { ms: [2, 2, 2], cs: [1, 0.5, 0.25], T0: [20, 20, 20], Q: 3000 }), q: { t: 'Eşit kütleli X, Y, Z sıvılarına eşit ısı verilince sıcaklık artışları 15, 30 ve 60 °C oluyor. Öz ısıları c<sub>X</sub>, c<sub>Y</sub>, c<sub>Z</sub> arasındaki ilişki nedir?', o: ['c<sub>X</sub> > c<sub>Y</sub> > c<sub>Z</sub>', 'c<sub>Z</sub> > c<sub>Y</sub> > c<sub>X</sub>', 'c<sub>X</sub> = c<sub>Y</sub> = c<sub>Z</sub>', 'c<sub>Y</sub> > c<sub>X</sub> > c<sub>Z</sub>'], f: ['k2a', 'k2b', 'k2c'],
      s: ['m ve Q eşit → c ∝ 1/ΔT', '<em>c<sub>X</sub> > c<sub>Y</sub> > c<sub>Z</sub></em> ✓'], n: ['Öz ısısı büyük madde yavaş ısınır, yavaş soğur.'] } },
    { q: { t: 'Öz ısıları: alüminyum 0,22, demir 0,11, bakır 0,09 cal/g·°C.<br>I. Eşit kütleli alüminyum ve demire eşit ısı verilirse demir daha çok ısınır.<br>II. 100 g demirin ısı sığası 11 cal/°C\'dir.<br>III. Eşit kütleli bakır ve demir eşit ısı verirse bakır daha çok soğur.<br>yargılarından hangileri doğrudur?', o: ['I, II ve III', 'Yalnız I', 'I ve II', 'II ve III'],
      s: ['I: c küçük → ΔT büyük ✓ · II: C = m c = 100 · 0,11 = 11 ✓', 'III: bakırın c\'si küçük → aynı ısıda daha çok sıcaklık değişimi ✓ → <em>I, II ve III</em>'], n: ['Tablo sorularında önce formülü yaz, sabitleri belirle, sonra orantı kur.'] } },
    { do: S => md(S, 'karisim', { mk: [200, 100], Tk: [80, 20], kar: 1 }), q: { t: '70 °C\'deki 300 g su ile 10 °C\'deki 100 g su karıştırılıyor. Isı kaybı yoksa denge sıcaklığı kaç °C\'dir?', o: ['55', '40', '50', '60'], f: ['k2c'],
      s: ['§1. YOL', '300 (70 − T) = 100 (T − 10) → 21000 − 300T = 100T − 1000 → <em>T = 55 °C</em> ✓', '§2. YOL', `T = ${F('300 · 70 + 100 · 10', '400')} = ${F('22 000', '400')} = <em>55 °C</em> ✓`], n: ['Aynı madde karıştırılınca denge sıcaklığı kütlelere göre ağırlıklı ortalamadır.'] } },
    { q: { t: '0 °C\'deki 50 g buz, 60 °C\'deki 200 g suya atılıyor. Isı kaybı yoksa denge sıcaklığı kaç °C olur?', o: ['32', '48', '30', '0'],
      s: ['Buzun erimesi: 50 · 80 = 4000 cal → su 4000 = 200 · ΔT → 20 °C soğur, 40 °C\'ye iner (buz tamamen erir).', 'Sonra 50 g (0 °C) ile 200 g (40 °C): T = (50 · 0 + 200 · 40) / 250 = <em>32 °C</em> ✓'], n: ['Önce buzun erimesi için yeterli ısı olup olmadığına bakılır; yoksa denge 0 °C olur ve bir kısım buz kalır.'] } },
    { q: { t: 'Başlangıç sıcaklıkları farklı K ve L cisimleri yalıtılmış kapta ısıl dengeye geliyor.<br>I. Isı alışverişi sıcaklıklar eşitlenince durur.<br>II. Isı her zaman iç enerjisi büyük olandan küçük olana akar.<br>III. Verilen ısı alınan ısıya eşittir.<br>yargılarından hangileri kesinlikle doğrudur?', o: ['I ve III', 'Yalnız I', 'I ve II', 'I, II ve III'],
      s: ['Isı sıcaklığı yüksek olandan akar (II yanlış).', 'I ve III doğru → <em>I ve III</em> ✓'], n: ['Büyük bir göl (iç enerjisi büyük) küçük bir sıcak demirden ısı alır.'] } },
    { do: S => md(S, 'termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 40 }), q: { t: 'X termometresi buzun erime noktasını 20 °X, suyun kaynama noktasını 120 °X gösteriyor. 40 °C kaç °X\'tir?', o: ['60', '40', '50', '48'], f: ['k2a', 'k2b'],
      s: [`${F('X − 20', '120 − 20')} = ${F('40', '100')} → X − 20 = 40`, '<em>X = 60 °X</em> ✓'], n: ['Bölme sayısı 100 olduğu için X, °C\'den sabit 20 fazladır.'] } },
    { q: { t: 'Aynı ortamdaki Y termometresi buzu −10 °Y, kaynayan suyu 140 °Y gösteriyor. X ve Y termometrelerinin aynı değeri gösterdiği sıcaklık kaç °X\'tir?', o: ['80', '20', '50', '−10'], f: ['k2c'],
      s: [`${F('X − 20', '100')} = ${F('X + 10', '150')} → 150X − 3000 = 100X + 1000`, '50X = 4000 → <em>X = 80 °X</em> ✓'], n: ['Bu tip sorularda iki dönüşüm eşitlenir; okunan değerler aynı alınır.'] } },
    { q: { t: 'Metal saplı tavada yemek pişirilirken sap da ısınıyor. Isı sapa hangi yolla ulaşır ve neden plastik sap tercih edilir?', o: ['İletimle; plastik ısıyı iyi iletmez', 'Işımayla; plastik ışığı yansıtır', 'Konveksiyonla; plastik ısıyı depolar', 'İletimle; plastik çabuk ısınır'],
      s: ['Katılarda ısı tanecikten taneciğe <em>iletimle</em> yayılır.', 'Plastik yalıtkandır; ısıyı iyi iletmez ✓'], n: ['Sıvı ve gazlarda konveksiyon (akım), boşlukta ışıma.'] } },
  ] });
  const g2 = gorev(sIs, { yk: 'TYT5-g7', no: 7, icon: '🔩', name: 'Soru sistemi: genleşme', task: 'Halka–küre, delik ve levha, çubuk uzaması, genleşme katsayısı karşılaştırma, raylar, suyun davranışı.', steps: [
    { do: S => md(S, 'halka', { isi: 0 }), sub: 'Halka, küre ve delikli levha.', go: '▶︎ Başlat' },
    { q: { t: 'Aynı sıcaklıktaki X küresi Y halkasından geçemiyor. Küre ve halka aynı maddeden yapılmıştır. Hangisi yapılırsa küre halkadan kesinlikle geçer?', o: ['Yalnız halkayı ısıtmak', 'İkisini eşit ısıtmak', 'Yalnız küreyi ısıtmak', 'İkisini eşit soğutmak'], f: ['k2a'],
      s: ['Aynı madde, aynı ΔT: oran korunur → geçemez.', 'Yalnız halka ısınırsa iç çapı büyür → <em>geçer</em> ✓'], n: ['Yalnız küreyi soğutmak da işe yarar.'] } },
    { do: S => { S.kos = 1; }, q: { t: 'Ortasında delik bulunan metal levha ısıtılıyor. Levhanın dış yarıçapı r<sub>1</sub>, delik yarıçapı r<sub>2</sub> ve levha kalınlığı x nasıl değişir?', o: ['Üçü de artar', 'r<sub>1</sub> artar, r<sub>2</sub> azalır, x artar', 'r<sub>1</sub> artar, r<sub>2</sub> ve x değişmez', 'Üçü de değişmez'], f: ['k2b'],
      s: ['Isınan cisim her boyutunda genleşir; delik de büyür.', '<em>Üçü de artar</em> ✓'], n: ['Deliğin küçüldüğünü sanmak en sık yapılan yanlıştır.'] } },
    { q: { t: '2 m uzunluğundaki metal çubuğun genleşme katsayısı 1,2 · 10<sup>−5</sup> 1/°C\'dir. Sıcaklığı 50 °C artırılırsa çubuk kaç mm uzar?', o: ['1,2', '0,6', '12', '2,4'],
      s: ['ΔL = L<sub>0</sub> λ ΔT = 2 · 1,2 · 10<sup>−5</sup> · 50 = 1,2 · 10<sup>−3</sup> m', '<em>1,2 mm</em> ✓'], n: ['Birim dönüştürmeye dikkat: 10<sup>−3</sup> m = 1 mm.'] } },
    { q: { t: 'Aynı maddeden yapılmış K (L, ΔT), L (2L, ΔT/2), M (L/2, 4ΔT) çubuklarının uzama miktarları arasındaki ilişki nedir?', o: ['ΔL<sub>M</sub> > ΔL<sub>K</sub> = ΔL<sub>L</sub>', 'ΔL<sub>K</sub> = ΔL<sub>L</sub> = ΔL<sub>M</sub>', 'ΔL<sub>L</sub> > ΔL<sub>K</sub> > ΔL<sub>M</sub>', 'ΔL<sub>K</sub> > ΔL<sub>L</sub> > ΔL<sub>M</sub>'],
      s: ['ΔL ∝ L<sub>0</sub> · ΔT: K → 1, L → 2 · ½ = 1, M → ½ · 4 = 2', '<em>ΔL<sub>M</sub> > ΔL<sub>K</sub> = ΔL<sub>L</sub></em> ✓'], n: ['Aynı madde → λ aynı; yalnız L<sub>0</sub> · ΔT çarpımına bak.'] } },
    { q: { t: 'Boyları eşit X ve Y çubukları eşit ısıtılınca X\'in uzaması Y\'ninkinin 2 katı oluyor. Bu iki metalden yapılan bimetal şerit ısıtılırsa nasıl bükülür?', o: ['Y tarafına (X dış yayda)', 'X tarafına (Y dış yayda)', 'Bükülmez', 'Önce X sonra Y tarafına'],
      s: ['λ<sub>X</sub> > λ<sub>Y</sub> → X daha çok uzar.', 'Çok uzayan dış yayda kalır: şerit <em>Y tarafına</em> bükülür ✓'], n: ['Soğutulunca tersi: X tarafına bükülür.'] } },
    { do: S => md(S, 'ray', { gun: 1 }), q: { t: 'I. Demiryolu raylarının arasında boşluk bırakılması<br>II. Elektrik tellerinin yazın sarkması<br>III. Kışın su borularının patlaması<br>olaylarından hangileri ısınan maddelerin genleşmesiyle açıklanır?', o: ['I ve II', 'Yalnız I', 'I ve III', 'I, II ve III'], f: ['k2a'],
      s: ['I ve II ısınınca uzama (genleşme).', 'III suyun donarken genleşmesidir (soğuma ile hacim artışı; istisna). <em>I ve II</em> ✓'], n: ['Su donarken hacmi artar, bu yüzden boruları çatlatır.'] } },
    { q: { t: 'Su 0 °C\'den 8 °C\'ye kadar ısıtılıyor. Hacminin sıcaklıkla değişimi nasıldır?', o: ['Önce azalır, 4 °C\'den sonra artar', 'Sürekli artar', 'Sürekli azalır', 'Önce artar sonra azalır'],
      s: ['0–4 °C arasında su ısınınca büzülür, 4 °C\'den sonra genleşir.', '<em>Önce azalır, sonra artar</em> ✓ (özkütle 4 °C\'de en büyük)'], n: ['Göllerin dibi kışın 4 °C\'de kalır, canlılar yaşar.'] } },
  ] });
  FZ.konuEk('TYT', 'Isı ve Sıcaklık', { dersler: [h1, h2], gorevler: [g1, g2] });
})();
