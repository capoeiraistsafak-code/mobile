// Kitap düzeninde konu anlatımı (HİKÂYE MODU) + soru sistemi · TYT Basınç ve Kaldırma Kuvveti
// Katıların basıncı · Sıvıların basıncı · Akışkanlar (Bernoulli) · U boruları, birleşik kaplar, hidrolik · Gazların basıncı · Kaldırma kuvveti
// Sorular özgündür (soru TİPLERİ örnek alınmıştır, sayılar ve durumlar farklıdır).
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');
  const CAM = () => new THREE.MeshPhongMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.22, shininess: 100, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false });
  const SIVI = (renk = 0x3b82f6, op = 0.6) => new THREE.MeshLambertMaterial({ color: renk, transparent: true, opacity: op, depthWrite: false });
  const KN = 0.04;   // kuvvet ölçeği (gerçek oranlı oklar): 1 N = 0,04 birim
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };
  // Musluk: gövde + ağız; a.akis (su ipi)
  const musluk = (g, x, y) => { const a = new THREE.Group(); a.position.set(x, y, 0); g.add(a);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 10), FZ.metal()); b.rotation.z = Math.PI / 2; b.position.x = -0.3; a.add(b);
    const ag = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.18, 10), FZ.metal()); ag.position.y = -0.08; a.add(ag);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 10), new THREE.MeshLambertMaterial({ color: 0xdc2626 })); t.position.set(-0.15, 0.1, 0); a.add(t);
    const ak = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), SIVI(0x60a5fa, 0.8)); a.add(ak); a.akis = ak; return a; };

  // ---------------- 3D BASINÇ LABORATUVARI (7 düzenek) ----------------
  const BR = [[2, 0.5, 1, 0.02], [2, 1, 0.5, 0.01], [1, 2, 0.5, 0.005]];   // tuğla konumları: genişlik x, yükseklik, derinlik z (birim; 1 birim = 10 cm), taban alanı m²
  const KAP = [0.5, 0.85, 0.28], KX = [-2.6, 0, 2.6], KH = 2;          // kapların taban/üst yarıçapı (1 birim = 20 cm), boyu
  const rAt = (i, y) => 0.5 + (KAP[i] - 0.5) * y / KH;
  const hacim = (i, h) => { const r = rAt(i, h); return 3 * h * (r * r + r * 0.5 + 0.25) / 3; };   // π = 3 alınır
  const hBul = (i, V) => { let a = 0, b = KH; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (hacim(i, m) < V) a = m; else b = m; } return (a + b) / 2; };
  const AKY = x => { const u = Math.min(1, Math.max(0, (Math.abs(x) - 0.6) / 0.6)); return 0.3 + 0.3 * (u * u * (3 - 2 * u)); };   // borunun yarıçapı
  const BARO = { 0: 76, 1000: 67, 2000: 60 };
  const MODLAR = ['kati', 'sivi', 'ubor', 'hid', 'akis', 'gaz', 'kald'];
  const sBs = sahne({ icon: '🧱', cam: [[0, 3.4, 10.5], [0, 1.5, 0]], plate: [12, 5, 0, 0], data: [['g', '10 m/s²'], ['Suyun özkütlesi', '1000 kg/m³ (1 g/cm³)']],
    cam2: S => ({ kati: [[2.3, 3.2, 10.2], [2.3, 0.9, 0]], sivi: [[2.3, 3.6, 12.2], [2.3, 2.1, 0]], ubor: [[2.9, 3, 10.7], [2.9, 1.9, 0]], hid: [[2.6, 3.2, 11.2], [2.6, 1.5, 0]], akis: [[2.3, 2.8, 11.2], [2.3, 1.6, 0]], gaz: [[0.9, 3.4, 13.5], [0.9, 2.1, 0]], kald: [[2.9, 3.6, 13], [2.9, 2.4, 0]] })[S.mod],
    S0: () => ({ mod: 'kati', o: 0, ust: 0, dongu: 0, kes: 0, karis: 0, yagH: 1, s1: 0.01, s2: 0.25, mk: 1000, x1: 50, V: 1, dt: 0.6, indH: 1, h: 1.5, dolum: 0, tt: 0, hs: [0, 0, 0], iz: [[], [], []], iki: 0, yag: 0, itis: 0, hiz: 1, irt: 0, gazP: 86, cis: 'demir', ind: 0, kos: 0 }),
    kur(g) {
      const G = {}; MODLAR.forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      const ece = FZ.kiz(g, 0xdb2777, 1.15);
      // KATI: sünger (üst yüzü çöker) + tuğla
      const sg = new THREE.BoxGeometry(3.2, 0.6, 2, 48, 1, 30), sung = new THREE.Mesh(sg, FZ.dokuMat('sunger', { roughness: 1 })); sung.position.set(0.4, 0.3, 0); G.kati.add(sung);   // gözenekli bulaşık süngeri
      const ovma = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 2), FZ.dokuMat('ovma')); ovma.position.set(0.4, -0.07 + 0.0, 0); G.kati.add(ovma); sung.position.y = 0.3 + 0.14; ovma.position.y = 0.07;   // altta yeşil ovma yüzü
      const sp0 = sg.attributes.position.array.slice();
      const tug = FZ.tugla(G.kati, 1, 1, 1); const tug2 = FZ.tugla(G.kati, 1, 1, 1);
      // SIVI: üç kap (silindir, ağzı geniş, ağzı dar) + musluklar + P–t panosu
      const kap = KAP.map((rt, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt + 0.03, 0.53, KH, 32, 1, true), CAM()); m.position.set(KX[i], KH / 2 + 0.06, 0); G.sivi.add(m);
        kutu(G.sivi, 1.25, 0.06, 1.25, 0x334155, KX[i], 0.03, 0); return m; });
      const su = KAP.map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), SIVI()); G.sivi.add(m); return m; });
      const yagK = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), SIVI(0xfacc15, 0.7)); G.sivi.add(yagK);
      const mus = KX.map(x => musluk(G.sivi, x + 0.05, KH + 0.55));
      const pano = kutu(G.sivi, 3.6, 2.2, 0.05, 0x111827, 5.6, 2.4, -0.4, { edge: false });
      const eks = duz(G.sivi, 0xe5e7eb), cz = [0x3b82f6, 0x22c55e, 0xf97316].map(c => duz(G.sivi, c));
      // U BORUSU: cam U boru, su ve yağ sütunları
      const UP = []; for (let i = 0; i <= 12; i++) UP.push(V3(-1, 3.3 - i * 0.2, 0)); for (let i = 1; i < 24; i++) { const a = Math.PI + i / 24 * Math.PI; UP.push(V3(Math.cos(a), 0.9 + Math.sin(a), 0)); } for (let i = 0; i <= 12; i++) UP.push(V3(1, 0.9 + i * 0.2, 0));
      const uYol = new THREE.CurvePath(); for (let i = 1; i < UP.length; i++) uYol.add(new THREE.LineCurve3(UP[i - 1], UP[i]));
      const uCam = new THREE.Mesh(new THREE.TubeGeometry(uYol, 120, 0.26, 16, false), CAM()); G.ubor.add(uCam);
      const uSu = new THREE.Mesh(new THREE.BufferGeometry(), SIVI()), uYag = new THREE.Mesh(new THREE.BufferGeometry(), SIVI(0xfacc15, 0.75)); G.ubor.add(uSu, uYag);
      kutu(G.ubor, 3, 0.1, 0.8, 0x78350f, 0, 0.05, -0.4); [-1, 1].forEach(x => kutu(G.ubor, 0.1, 3.3, 0.1, 0x78350f, x, 1.65, -0.4));
      const ubMus = musluk(G.ubor, -0.95, 3.75);
      // HİDROLİK: küçük ve büyük silindir, alttan bağlı; pistonlar; araba
      const hs1 = silindir(G.hid, 0.27, 0.27, 2.4, 0xdbeafe, -2.3, 1.2, 0, { op: 0.3, edge: false }), hs2 = silindir(G.hid, 1.23, 1.23, 2, 0xdbeafe, 1.2, 1, 0, { op: 0.3, edge: false });
      kutu(G.hid, 3.6, 0.4, 0.5, 0x93c5fd, -0.5, 0.2, 0, { op: 0.6, edge: false });
      const hsu1 = silindir(G.hid, 0.25, 0.25, 1, 0x3b82f6, -2.3, 1, 0, { op: 0.6, edge: false }), hsu2 = silindir(G.hid, 1.2, 1.2, 1, 0x3b82f6, 1.2, 1, 0, { op: 0.6, edge: false });
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 20), FZ.metal(0x6b7280)), p2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.14, 32), FZ.metal(0x6b7280)); G.hid.add(p1, p2);
      const kol = kutu(G.hid, 0.06, 1.2, 0.06, 0x374151, -2.3, 2.6, 0, { edge: false });
      const car = FZ.araba(G.hid, 0x2563eb); car.scale.setScalar(1.05);
      // AKIŞ: daralan cam boru, su tanecikleri, üç manometre borusu
      const pr = []; for (let i = 0; i <= 40; i++) { const x = -3.6 + i * 7.2 / 40; pr.push(new THREE.Vector2(AKY(x), x)); }
      const boru = new THREE.Mesh(new THREE.LatheGeometry(pr, 28), CAM()); boru.rotation.z = -Math.PI / 2; boru.position.y = 0.9; G.akis.add(boru);
      const tan = []; for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), new THREE.MeshBasicMaterial({ color: 0x2563eb })); m.userData = { x: -3.6 + Math.random() * 7.2, a: Math.random() * 6.3, r: Math.random() * 0.8 }; G.akis.add(m); tan.push(m); }
      const mano = [-2.4, 0, 2.4].map(x => { silindir(G.akis, 0.1, 0.1, 3, 0xdbeafe, x, 1 + AKY(x) + 1.4, 0, { op: 0.3, edge: false }); return silindir(G.akis, 0.08, 0.08, 1, 0x3b82f6, x, 2, 0, { op: 0.8, edge: false }); });
      const ov = [-2.4, 0, 2.4].map((x, i) => ok(0x111827, 'bsv' + i));
      // GAZ: Torricelli barometresi (cıva) + kapalı kaptaki gaz ve açık uçlu cıva manometresi
      kutu(G.gaz, 1.4, 0.3, 1, 0x9ca3af, -0.9, 0.15, 0, { op: 0.6 });
      const civaK = kutu(G.gaz, 1.3, 0.2, 0.9, 0xb4b8c0, -0.9, 0.18, 0, { edge: false }); civaK.material = FZ.metal(0xb4b8c0);
      silindir(G.gaz, 0.13, 0.13, 4.4, 0xdbeafe, -0.9, 2.3, 0, { op: 0.3, edge: false });
      const bCiva = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 12), FZ.metal(0xb4b8c0)); G.gaz.add(bCiva);
      const cetvel = kutu(G.gaz, 0.06, 4, 0.02, 0xfef3c7, -0.55, 2.2, 0, { edge: false });
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 16), CAM()); fl.position.set(1, 1.2, 0); G.gaz.add(fl);
      const gz = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xef4444 })); m.userData = { v: V3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() }; m.position.set(1 + (Math.random() - 0.5) * 0.8, 1.2 + (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8); G.gaz.add(m); gz.push(m); }
      silindir(G.gaz, 0.08, 0.08, 1.1, 0xdbeafe, 2.3, 1.2, 0, { op: 0.3, edge: false }).rotation.z = Math.PI / 2;
      [2.85, 3.75].forEach(x => silindir(G.gaz, 0.12, 0.12, 3.2, 0xdbeafe, x, 2, 0, { op: 0.3, edge: false }));
      kutu(G.gaz, 1.0, 0.2, 0.22, 0xdbeafe, 3.3, 0.45, 0, { op: 0.3, edge: false });
      const mc = [2.85, 3.75].map(x => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 12), FZ.metal(0xb4b8c0)); m.position.x = x; G.gaz.add(m); return m; });
      kutu(G.gaz, 0.9, 0.12, 0.18, 0xb4b8c0, 3.3, 0.45, 0, { edge: false }).material = FZ.metal(0xb4b8c0);
      // KALDIRMA: su kabı, dinamometre, cisim
      const kk = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.6, 32, 1, true), CAM()); kk.position.set(0, 1.3, 0); G.kald.add(kk); kutu(G.kald, 2.5, 0.06, 2.5, 0x334155, 0, 0.03, 0);
      const ksu = silindir(G.kald, 1.12, 1.12, 1, 0x3b82f6, 0, 0.8, 0, { op: 0.5, edge: false }); ksu.material = SIVI(0x3b82f6, 0.5);
      kutu(G.kald, 0.15, 5.2, 0.15, 0x475569, -2, 2.6, 0); kutu(G.kald, 2.2, 0.12, 0.15, 0x475569, -0.95, 5.15, 0);
      const din = new THREE.Group(); G.kald.add(din);
      const dg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 14), FZ.metal(0xe5e7eb)); dg.position.y = -0.55; din.add(dg);
      for (let i = 0; i < 6; i++) kutu(din, 0.06, 0.01, 0.02, 0x111827, 0.17, -0.25 - i * 0.12, 0.1, { edge: false });
      const dip = silindir(din, 0.012, 0.012, 1, 0x111827, 0, -1.6, 0, { edge: false });
      const cis = kutu(G.kald, 0.8, 0.8, 0.8, 0x6b7280, 0, 3, 0); cis.material = FZ.metal(0x6b7280);
      const oG = ok(0x475569, 'bsG'), oT = ok(0x0ea5e9, 'bsT'), oF = ok(0x16a34a, 'bsF'), oN = ok(0x0ea5e9, 'bsN');
      [['bsG', 'G', '#475569'], ['bsT', 'T', '#0284c7'], ['bsF', 'F<sub>k</sub>', '#16a34a'], ['bsN', 'N', '#0284c7'], ['bsv0', 'v<sub>1</sub>', '#111827'], ['bsv1', 'v<sub>2</sub>', '#111827'], ['bsv2', 'v<sub>3</sub>', '#111827']].forEach(([i, h, c]) => etiket(i, h, c));
      ['bsA', 'bsB', 'bsC', 'bsD', 'bsE', 'bsH'].forEach(i => etiket(i, '', '#1e3a8a')); kart('bsK', '', '#F5C400'); kart('bsP', '', '#2563eb');
      return { G, ece, sung, sg, sp0, tug, tug2, kap, su, yagK, mus, pano, eks, cz, uYol, uSu, uYag, ubMus, hsu1, hsu2, p1, p2, kol, car, tan, mano, ov, bCiva, gz, mc, din, dip, cis, ksu, oG, oT, oF, oN, sonO: -1 };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      const A = (a, p, d, L, id, dx = 0.3) => { if (L < 0.02) { a.visible = false; return; } FZ.setArrow(a, p, d, L); FZ.show(id, p.clone().add(d.clone().normalize().multiplyScalar(L + 0.25)).add(V3(dx, 0, 0)), 1); };
      [o.oG, o.oT, o.oF, o.oN].forEach(a => a.visible = false); o.ece.visible = S.mod === 'kati' || S.mod === 'hid';
      if (S.mod === 'kati') {
        if (S.dongu) S.o = Math.floor(S.t / 1.6) % 3; let [w, h, d, Sm] = BR[S.o]; if (S.kes) { w /= 2; Sm /= 2; } const Gt = 20 * (1 + S.ust) * (S.kes ? 0.5 : 1), P = Gt / Sm, dent = Math.min(0.3, P / 8000 * 0.3);
        S.P = P; if (o.sonO !== S.o * 10 + S.ust + S.kes * 100) { o.sonO = S.o * 10 + S.ust + S.kes * 100; const pa = o.sg.attributes.position.array;
          for (let i = 0; i < pa.length; i += 3) { const x = o.sp0[i], y = o.sp0[i + 1], z = o.sp0[i + 2]; let yy = y;
            if (y > 0.29) { const ex = Math.max(0, Math.abs(x) - w / 2), ez = Math.max(0, Math.abs(z) - d / 2), e = Math.hypot(ex, ez); yy = 0.3 - dent * Math.max(0, 1 - e / 0.35); } pa[i + 1] = yy; }
          o.sg.attributes.position.needsUpdate = true; o.sg.computeVertexNormals(); }
        const yb = 0.74 - dent; o.tug.scale.set(w, h, d); o.tug.position.set(0.4, yb + h / 2, 0); o.tug2.visible = !!S.ust; o.tug2.scale.set(w, h, d); o.tug2.position.set(0.4, yb + h * 1.5, 0);
        o.ece.position.set(-2.6, 0, 0.3); o.ece.rotation.y = -0.4;
        const top_ = yb + h * (1 + S.ust), c = V3(0.4, yb + h * (1 + S.ust) / 2, d / 2 + 0.05);
        A(o.oG, c.clone().add(V3(-0.2, 0, 0)), V3(0, -1, 0), Gt * KN, 'bsG', -0.55); A(o.oN, V3(0.75, yb, d / 2 + 0.05), V3(0, 1, 0), Gt * KN, 'bsN', 0.35);
        FZ.setTag('bsK', `G = ${Gt} N · S = ${String(Sm).replace('.', ',')} m² · P = ${F('G', 'S')} = <b>${Math.round(P)} Pa</b>`); FZ.show('bsK', V3(0.4, 3.1, 0), 1);
      } else if (S.mod === 'sivi') {
        if (S.dolum) { if (S.kos) S.tt += dt; const Q = 0.55;
          for (let i = 0; i < 3; i++) { S.hs[i] = Math.min(KH, hBul(i, Q * S.tt)); if (S.kos) { const L = S.iz[i]; if (!L.length || S.tt - L[L.length - 1][0] > 0.05) L.push([S.tt, S.hs[i]]); } }
          if (S.hs.every(x => x >= KH - 1e-3)) S.kos = 0; }
        else S.hs = [S.h, S.h, S.h];
        for (let i = 0; i < 3; i++) { const h = Math.max(0.01, S.hs[i]), m = o.su[i], r = rAt(i, h); const yagH = S.iki && i === 0 ? 0.5 : 0, hw = i === 0 && S.iki ? Math.max(0.01, h - yagH) : h;
          if (m.userData.h !== hw || m.userData.r !== rAt(i, hw)) { m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(rAt(i, hw) - 0.02, 0.48, hw, 32); m.userData.h = hw; m.userData.r = rAt(i, hw); }
          m.position.set(KX[i], 0.06 + hw / 2, 0);
          o.mus[i].visible = !!S.dolum; o.mus[i].akis.visible = S.kos && S.dolum && S.hs[i] < KH - 1e-3; const al = KH + 0.45 - h; o.mus[i].akis.scale.y = al; o.mus[i].akis.position.y = -0.17 - al / 2;
          const P = Math.round(h * 0.2 * 10000) + (S.iki && i === 0 ? -Math.round(yagH * 0.2 * 2000) : 0);
          FZ.setTag(['bsA', 'bsB', 'bsC'][i], `P = ${P} Pa`); FZ.show(['bsA', 'bsB', 'bsC'][i], V3(KX[i], -0.35, 0.8), 1); }
        o.yagK.visible = !!S.iki && !S.karis; if (S.iki) o.su[0].material.color.setHex(S.karis ? 0x84cc16 : 0x3b82f6); else o.su[0].material.color.setHex(0x3b82f6); if (S.iki) { o.yagK.scale.set(1, 0.5, 1); o.yagK.position.set(KX[0], 0.06 + S.hs[0] - 0.25, 0); }
        if (!S.dolum && !S.iki) { const Fv = Math.round(S.h * 0.2 * 10000 * 0.03), Gs = [0, 1, 2].map(i => Math.round(hacim(i, S.h) * 0.008 * 10000));
          FZ.setTag('bsK', `Taban alanları eşit (S = 0,03 m²) · F = P·S = ${Fv} N · ağırlıklar: G<sub>1</sub> = ${Gs[0]} N, G<sub>2</sub> = ${Gs[1]} N, G<sub>3</sub> = ${Gs[2]} N`); }
        else if (S.iki) FZ.setTag('bsK', 'Yağ (d = 0,8 g/cm³) 10 cm · su 20 cm'); else FZ.setTag('bsK', `Eşit debili musluklar · t = ${fs(S.tt)} s`);
        FZ.show('bsK', V3(0, 3.55, 0), 1);
        o.pano.visible = !!S.dolum; o.eks.visible = !!S.dolum; o.cz.forEach(l => l.visible = !!S.dolum);
        if (S.dolum) { const X = t => 4 + t / 14 * 3.2, Y = h => 1.5 + h / KH * 1.8, Z = -0.35; FZ.setLine(o.eks, [V3(X(0), Y(KH) + 0.1, Z), V3(X(0), Y(0), Z), V3(X(14), Y(0), Z)]);
          S.iz.forEach((L, i) => { if (L.length > 1) FZ.setLine(o.cz[i], L.map(([t, h]) => V3(X(Math.min(14, t)), Y(h), Z))); else o.cz[i].visible = false; });
          FZ.setTag('bsP', 'P – t'); FZ.show('bsP', V3(5.6, 3.7, -0.35), 1); }
      } else if (S.mod === 'ubor') {
        const hy = S.yag * S.yagH, x = 0.4 * hy, y0 = 2.0, ara = y0 - x, sag = y0 + x, ust = ara + hy;
        const sL = y => 3.3 - y, sR = y => 2.4 + Math.PI + (y - 0.9), T = o.uYol.getLength();
        const parca = (s0, s1) => { const n = 60, pts = []; for (let i = 0; i <= n; i++) pts.push(o.uYol.getPointAt(Math.min(1, (s0 + (s1 - s0) * i / n) / T))); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.23, 12, false); };
        o.uSu.geometry.dispose(); o.uSu.geometry = parca(sL(ara), sR(sag)); o.uYag.visible = hy > 0.01; if (hy > 0.01) { o.uYag.geometry.dispose(); o.uYag.geometry = parca(sL(ust), sL(ara)); }
        o.ubMus.akis.visible = S.kos && S.yag < 1; o.ubMus.akis.material.color.setHex(0xfacc15); const al = 3.65 - ust; o.ubMus.akis.scale.y = al; o.ubMus.akis.position.y = -0.17 - al / 2;
        if (S.kos) { S.yag = Math.min(1, S.yag + dt * 0.3); if (S.yag >= 1) S.kos = 0; }
        FZ.setTag('bsA', `yağ ${Math.round(hy * 10)} cm`); FZ.show('bsA', V3(-1.85, (ara + ust) / 2, 0), hy > 0.05 ? 1 : 0);
        FZ.setTag('bsB', `su ${Math.round(2 * x * 10)} cm`); FZ.show('bsB', V3(1.85, (ara + sag) / 2, 0), hy > 0.05 ? 1 : 0);
        FZ.setTag('bsC', `fark ${fs((ust - sag) * 10)} cm`); FZ.show('bsC', V3(0, ust + 0.5, 0), hy > 0.05 ? 1 : 0);
        FZ.setTag('bsK', 'Aynı yatay düzlemde, aynı sıvının içindeki noktalarda basınç eşittir'); FZ.show('bsK', V3(0.3, 4.1, 0), 1);
      } else if (S.mod === 'hid') {
        if (S.kos) { S.itis = Math.min(1, S.itis + dt * 0.4); if (S.itis >= 1) S.kos = 0; }
        const r_ = S.s2 / S.s1, x1 = S.itis * S.x1 / 40, x2 = x1 / r_, y1 = 2.0 - x1, y2 = 1.5 + x2;
        o.hsu1.scale.y = y1 - 0.4; o.hsu1.position.y = 0.4 + (y1 - 0.4) / 2; o.hsu2.scale.y = y2 - 0.4; o.hsu2.position.y = 0.4 + (y2 - 0.4) / 2;
        o.p1.position.set(-2.3, y1 + 0.06, 0); o.p2.position.set(1.2, y2 + 0.07, 0); o.kol.position.y = y1 + 0.7; o.car.position.set(1.2, y2 + 0.14, 0);
        o.ece.position.set(-3.1, 0, 0); o.ece.rotation.y = 0; FZ.koluUzat(o.ece, 0, V3(-2.3, y1 + 1.3, 0.05)); FZ.koluUzat(o.ece, 1, V3(-2.3, y1 + 1.3, -0.05));
        A(o.oT, V3(-2.3, y1 + 2.4, 0.3), V3(0, -1, 0), 400 * 0.0025, 'bsT', 0.4); const F1 = S.mk * 10 * S.s1 / S.s2; FZ.setTag('bsT', `F<sub>1</sub> = ${Math.round(F1)} N`);
        A(o.oG, V3(1.2, y2 + 1.1, 1.0), V3(0, -1, 0), 10000 * 0.0025 * 0.1, 'bsG', 0.6); FZ.setTag('bsG', `G = ${S.mk * 10} N (ölçek ⅒)`);
        FZ.setTag('bsA', `S<sub>1</sub> = ${String(S.s1).replace('.', ',')} m² · iniş ${Math.round(x1 * 40)} cm`); FZ.show('bsA', V3(-2.3, -0.35, 0.5), 1);
        FZ.setTag('bsB', `S<sub>2</sub> = ${String(S.s2).replace('.', ',')} m² · çıkış ${fs(x2 * 40)} cm`); FZ.show('bsB', V3(1.2, -0.35, 1.3), 1);
        FZ.setTag('bsK', `${F('F<sub>1</sub>', 'S<sub>1</sub>')} = ${F('F<sub>2</sub>', 'S<sub>2</sub>')} → ${F(String(Math.round(F1)), String(S.s1).replace('.', ','))} = ${F(String(S.mk * 10), String(S.s2).replace('.', ','))}`); FZ.show('bsK', V3(0, 4.2, 0), 1);
      } else if (S.mod === 'akis') {
        o.tan.forEach(m => { const u = m.userData, r = AKY(u.x), v = S.hiz * (0.6 / r) ** 2 * 0.6; u.x += v * dt; if (u.x > 3.6) u.x -= 7.2; const rr = AKY(u.x) * 0.8 * u.r; m.position.set(u.x, 0.9 + Math.sin(u.a) * rr, Math.cos(u.a) * rr); });
        const hs = [-2.4, 0, 2.4].map(x => { const v = S.hiz * (0.6 / AKY(x)) ** 2; return Math.max(0.15, 2.4 - 0.11 * v * v); });
        o.mano.forEach((m, i) => { const x = [-2.4, 0, 2.4][i], b = 0.9 + AKY(x); m.scale.y = hs[i] + 0.2; m.position.y = b - 0.2 + (hs[i] + 0.2) / 2; });
        [-2.4, 0, 2.4].forEach((x, i) => { const v = S.hiz * (0.6 / AKY(x)) ** 2; A(o.ov[i], V3(x - 0.35 * v * 0.35, 0.2, 0.9), V3(1, 0, 0), v * 0.35, 'bsv' + i, 0); });
        FZ.setTag('bsK', `Dar kesitte hız ${fs((0.6 / 0.3) ** 2)} katı → basınç düşük (manometre suyu alçak)`); FZ.show('bsK', V3(0, 4.1, 0), 1);
      } else if (S.mod === 'gaz') {
        const P0 = BARO[S.irt], hb = P0 / 76 * 3.8; o.bCiva.scale.y = hb; o.bCiva.position.set(-0.9, 0.28 + hb / 2, 0);
        o.gz.forEach(m => { m.position.add(m.userData.v.clone().multiplyScalar(dt * 1.6 * (S.gazP / 86))); const d = m.position.clone().sub(V3(1, 1.2, 0)); if (d.length() > 0.72) { const n = d.normalize(); m.userData.v.sub(n.clone().multiplyScalar(2 * m.userData.v.dot(n))); m.position.copy(V3(1, 1.2, 0).add(n.multiplyScalar(0.71))); } });
        const dh = (S.gazP - P0) / 76 * 3.8 / 2, y0 = 1.6; [y0 - dh, y0 + dh].forEach((y, i) => { o.mc[i].scale.y = y - 0.45; o.mc[i].position.y = 0.45 + (y - 0.45) / 2; });
        FZ.setTag('bsA', `h = ${P0} cm`); FZ.show('bsA', V3(-0.1, 0.28 + hb / 2, 0.3), 1);
        FZ.setTag('bsB', `Δh = ${S.gazP - P0} cm`); FZ.show('bsB', V3(2.3, y0 + 1.2, 0.3), 1);
        FZ.setTag('bsK', `${S.irt} m · P<sub>0</sub> = ${P0} cmHg · P<sub>gaz</sub> = ${S.gazP} cmHg`); FZ.show('bsK', V3(1.2, 4.2, 0), 1);
      } else {
        const d = { demir: 3, tahta: S.dt, askida: 1 }[S.cis], V = S.V, G = 10 * d * V, kn = 0.8 * Math.cbrt(V); let yb;
        if (S.kos) { S.ind = Math.min(S.indH, S.ind + dt * 0.35); if (S.ind >= S.indH) S.kos = 0; }
        const L0 = 0.8 + 0.6;   // boş kapta su seviyesi 1,4
        if (S.cis === 'demir') yb = 3.6 - S.ind * 3.3; else if (S.cis === 'tahta') { const yer = L0 + 0.14 * S.dt - 0.8 * S.dt; yb = 3.6 - S.ind * (3.6 - yer); } else { const yer = 0.65; yb = 3.6 - S.ind * (3.6 - yer); }
        let s = 0; for (let k = 0; k < 3; k++) { const lev = L0 + 0.14 * s; s = Math.max(0, Math.min(1, (lev - yb) / 0.8)); }
        if (S.cis === 'tahta') s = Math.min(s, S.dt);
        const lev = L0 + 0.14 * s; o.ksu.scale.y = lev - 0.06; o.ksu.position.y = 0.06 + (lev - 0.06) / 2;
        o.cis.scale.setScalar(kn / 0.8); const Fk = 10 * V * s, T = S.cis === 'demir' ? G - Fk : Math.max(0, G - Fk);
        o.cis.position.set(0, yb + 0.4, 0); o.cis.material.color.setHex({ demir: 0xef4444, tahta: 0xd97706, askida: 0x22d3ee }[S.cis]);
        o.din.visible = S.cis === 'demir'; o.din.position.set(0, 5.1, 0); o.dip.scale.y = 5.1 - 1.1 - (yb + 0.8); o.dip.position.y = -1.1 - o.dip.scale.y / 2;
        const c = V3(0, yb + 0.4, 0.45);
        A(o.oG, c, V3(0, -1, 0), G * KN, 'bsG', 0.35); FZ.setTag('bsG', `G = ${fs(G)} N`);
        if (Fk > 0.05) { A(o.oF, V3(0.25, yb + 0.4 * s, 0.45), V3(0, 1, 0), Fk * KN, 'bsF', 0.4); FZ.setTag('bsF', `F<sub>k</sub> = ${fs(Fk)} N`); }
        if (S.cis === 'demir') { A(o.oT, V3(0, yb + 0.8, 0.45), V3(0, 1, 0), T * KN, 'bsT', 0.4); FZ.setTag('bsT', `T = ${fs(T)} N`); }
        FZ.setTag('bsK', S.cis === 'demir' ? `Dinamometre ${fs(T)} N · batan %${Math.round(s * 100)}` : S.cis === 'tahta' ? `Yüzüyor · batan %${Math.round(S.dt * 100)}` : 'Askıda: F<sub>k</sub> = G');
        FZ.show('bsK', V3(1.6, 3.6, 0), 1);
      }
    },
    qp: () => V3(0, 3.8, 0) });

  const md = (S, mod, x) => Object.assign(S, { mod, kos: 0 }, x || {});
  const NT = { kati: ['Ağırlık (G) cismin ağırlık merkezinden düşey aşağıdır; zeminin tepkisi (N) yüzeyden cisme, yukarıdır. Dengede eşit büyüklüktedir ama etki–tepki çifti değildir (ikisi de tuğlaya etki eder).', 'Basınç kuvveti (F) yüzeye dik toplam kuvvet; basınç (P) birim yüzeye düşen kuvvettir.'],
    sivi: ['Sıvı basıncı yalnız derinliğe ve sıvının özkütlesine bağlıdır: P = h · d · g. Kabın biçimi ve sıvının miktarı önemli değildir.', 'Tabandaki basınç kuvveti F = P · S. Bu, sıvının ağırlığına yalnız düz kenarlı (silindir/prizma) kaplarda eşittir.'] };

  // ======================= HİKÂYE 1 · KATILAR VE SIVILAR =======================
  const h1 = ders(sBs, { yk: 'TYT8-d2', no: 2, icon: '📖', name: 'Hikâye: Ece\'nin süngeri ve barajın sırrı', task: 'Katıların basıncı, sıvıların basıncı, kap biçimi, karışmayan sıvılar, musluk grafikleri, basınç kuvveti.', notlar: [...NT.kati, ...NT.sivi], steps: [
    { do: S => md(S, 'kati', { o: 0, ust: 0 }), sub: 'Ece, bulaşık süngerinin üstüne bir tuğla koydu. Tuğla süngere biraz gömüldü.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'merak', b: 'Aynı tuğla, aynı ağırlık… ama neden bazen derin, bazen sığ iz bırakıyor?', m: ['Ece tuğlayı üç farklı yüzü üstüne koyup süngerdeki izi karşılaştıracak.'], dugme: 'İzleyelim ▶︎' } },
    { k: { tur: 'kavram', b: 'Basınç kuvveti ve basınç', f: ['bsG', 'bsN'], m: ['Tuğla süngere ağırlığı kadar kuvvet uygular: buna <em>basınç kuvveti</em> (F) denir. Burada F = G = 20 N.', `Birim yüzeye düşen kuvvete <em>basınç</em> denir: ${FM(`P = ${F('F', 'S')}`)} · birimi N/m² = pascal (Pa).`] } },
    { do: S => { S.o = 1; }, sub: 'Ece tuğlayı yan yüzüne çevirdi: yere değen yüzey yarıya indi.', wait: 2.5 },
    { p: { t: 'Tuğla en küçük yüzü (0,005 m²) üstüne dikilirse süngerdeki iz nasıl olur?', o: ['En sığ iz', 'Aynı iz', 'En derin iz', 'İz oluşmaz'], d: 2 } },
    { do: S => { S.o = 2; }, sub: 'Tuğla dik konuldu…', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yüzey küçüldü, basınç büyüdü', f: ['bsK'], m: ['Üç konumda da F = 20 N (ağırlık değişmedi). Basınçlar: 1000 Pa, 2000 Pa, <em>4000 Pa</em>.', 'Neden? Aynı kuvvet daha küçük bir alana dağılınca her santimetrekareye düşen pay artar.'] } },
    { do: S => { S.ust = 1; }, sub: 'Ece dik tuğlanın üstüne özdeş bir tuğla daha koydu.', wait: 2.5 },
    { k: { tur: 'ornek', b: 'Küçük örnek', f: ['bsK'], m: ['Ağırlık 40 N oldu, yüzey aynı (0,005 m²): P = 40 / 0,005 = <em>8000 Pa</em> → basınç 2 katına çıktı.', 'Kural: P, G ile doğru, S ile ters orantılıdır.'] } },
    { k: { tur: 'gunluk', b: 'Günlük hayatta', m: ['Bıçak ve iğnenin ucu sivridir (S küçük → P büyük, kolay keser).', 'Kar ayakkabısı, tankların paleti, kamyonların çok tekerleği yüzeyi büyütür (P küçük → batmaz).'] } },
    { k: { tur: 'dikkat', b: 'UYARI · Kesme ve çevirme', m: ['Düzgün (dik kenarlı) bir cisim düşey kesilip yarısı alınırsa G ve S yarıya iner: <em>P değişmez</em>.', 'Katılar basıncı yalnız kuvvet doğrultusunda iletir; sıvılar ise her yöne iletir.'] } },
    { do: S => md(S, 'sivi', { h: 1.5, dolum: 0, iki: 0 }), sub: 'Hafta sonu Ece babasıyla bir barajı gezdi. Barajın duvarı tabana doğru kalınlaşıyordu. Eve dönünce üç farklı kapla deney kurdu.', go: '▶︎ Devam' },
    { k: { tur: 'kavram', b: 'Sıvı basıncı', f: ['bsA', 'bsB', 'bsC'], m: ['Sıvılar da ağırlıkları yüzünden bulundukları kaba basınç yapar.', `${FM('P = h · d · g')} · h: noktanın sıvı yüzeyine düşey uzaklığı (derinlik), d: sıvının özkütlesi.`, '30 cm su: P = 0,3 · 1000 · 10 = <em>3000 Pa</em>.'] } },
    { p: { t: 'Taban alanları eşit üç kapta (düz, ağzı geniş, ağzı dar) su yüksekliği aynı. Tabandaki su basıncı hangisinde büyüktür?', o: ['Ağzı geniş olanda', 'Ağzı dar olanda', 'Üçünde eşit', 'Düz olanda'], d: 2 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Basınç kabın biçimine bağlı değil', f: ['bsA', 'bsB', 'bsC'], m: ['Üç kapta da P = 3000 Pa. Basınç yalnız h ve d\'ye bağlıdır; sıvının miktarı ve kabın biçimi önemli değildir.', 'Baraj bu yüzden tabanda kalındır: derinlik arttıkça basınç artar.'] } },
    { k: { tur: 'kavram', b: 'Sıvı basınç kuvveti ve ağırlık', f: ['bsK'], m: [`${FM('F = P · S')} · tabanı eşit kaplarda F de eşittir: F = 3000 · 0,03 = 90 N.`, 'Ama ağırlıklar farklı! Düz kapta F = G, ağzı geniş kapta <em>F < G</em> (yan duvarlar suyun bir kısmını taşır), ağzı dar kapta <em>F > G</em> (yan duvarlar suyu aşağı iter).'] } },
    { do: S => md(S, 'sivi', { dolum: 1, tt: 0, hs: [0, 0, 0], iz: [[], [], []], kos: 1 }), sub: 'Ece boş kapları eşit debili musluklarla dolduruyor; panoda P – t grafikleri çiziliyor.', until: S => !S.kos },
    { k: { tur: 'dikkat', b: 'UYARI · Musluk grafikleri', f: ['bsP'], m: ['Düz kapta su düzgün yükselir: P – t grafiği <em>doğrusal</em> (mavi).', 'Ağzı geniş kapta yukarı çıktıkça yükselme yavaşlar: grafiğin eğimi <em>azalır</em> (yeşil). Ağzı dar kapta hızlanır: eğim <em>artar</em> (turuncu).'] } },
    { do: S => md(S, 'sivi', { dolum: 0, iki: 1, h: 1.5 }), sub: 'Son olarak düz kaba 20 cm su, üstüne 10 cm yağ koydu.', wait: 2 },
    { k: { tur: 'ornek', b: 'Karışmayan sıvılar', f: ['bsA'], m: [`Tabandaki basınç katmanların toplamıdır: ${FM('P = h<sub>1</sub> d<sub>1</sub> g + h<sub>2</sub> d<sub>2</sub> g')}`, 'P = 0,1 · 800 · 10 + 0,2 · 1000 · 10 = 800 + 2000 = <em>2800 Pa</em>.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`P = ${F('F', 'S')}`)} katılar · ${FM('P = h d g')} sıvılar · ${FM('F = P S')}`, 'Sıvı basıncı kap biçimine bağlı değildir · F ile G yalnız düz kapta eşittir.'] } },
  ] });

  // ======================= HİKÂYE 2 · U BORUSU, KRİKO, AKIŞ, GAZ =======================
  const h2 = ders(sBs, { yk: 'TYT8-d3', no: 3, icon: '📖', name: 'Hikâye: U borusu, kriko, rüzgâr ve dağdaki barometre', task: 'U boruları ve birleşik kaplar, Pascal ilkesi ve hidrolik lift, akışkanlarda basınç (Bernoulli), açık hava ve gaz basıncı.', notlar: ['U borusunda aynı sıvının içindeki aynı yatay düzlemdeki noktalarda basınç eşittir.', 'Sıvılar üzerlerine uygulanan basıncı her yöne aynen iletir (Pascal).', 'Akışkanın hızlandığı yerde basıncı düşer (Bernoulli).', 'Açık hava basıncı deniz seviyesinde 76 cmHg\'dir; yükseldikçe azalır.'], steps: [
    { do: S => md(S, 'ubor', { yag: 0 }), sub: 'Ece okulun laboratuvarında içinde su olan bir U borusu buldu. İki koldaki su aynı seviyedeydi.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Birleşik kaplar', m: ['Tabandan bağlı kaplarda aynı sıvı <em>aynı seviyede</em> durur (kabın biçimi ne olursa olsun).', 'Çaydanlığın ağzı ile gövdesi, şehir su depoları ve su terazisi bu ilkeyle çalışır.'] } },
    { p: { t: 'Sol kola 10 cm yağ (d = 0,8 g/cm³) dökülürse yağın üst yüzeyi ile sağdaki su yüzeyi arasında ne olur?', o: ['Su yüzeyi daha yüksekte olur', 'Yağ yüzeyi daha yüksekte olur', 'Aynı seviyede olur', 'Yağ suyun altına iner'], d: 1 } },
    { sub: 'Sol kola yağ dökelim.', go: '▶︎ Yağ dök' },
    { do: S => { S.kos = 1; }, sub: 'Yağ dökülüyor; su sağ kolda yükseliyor…', until: S => S.yag >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Eşit basınç düzlemi', f: ['bsA', 'bsB', 'bsC'], m: ['Yağ–su sınırından geçen yatay düzlemde iki koldaki basınçlar eşittir:', `${FM('h<sub>yağ</sub> · d<sub>yağ</sub> = h<sub>su</sub> · d<sub>su</sub>')} → 10 · 0,8 = h<sub>su</sub> · 1 → h<sub>su</sub> = <em>8 cm</em>.`, 'Yağ daha az yoğun olduğu için daha uzun sütun gerekir: yağ yüzeyi suyunkinden <em>2 cm</em> yüksekte.'] } },
    { do: S => md(S, 'hid', { itis: 0 }), sub: 'Ece babasıyla oto tamircisine gitti. Usta, küçük bir pistonu iterek koca arabayı kaldırıyordu.', go: '▶︎ Pistonu it' },
    { do: S => { S.kos = 1; }, sub: 'Usta küçük pistonu 50 cm aşağı itiyor…', until: S => S.itis >= 1 },
    { k: { tur: 'kavram', b: 'Pascal ilkesi ve hidrolik lift', f: ['bsK', 'bsT', 'bsG'], m: ['Kapalı kaptaki sıvı, üzerine uygulanan basıncı <em>her yöne aynen</em> iletir.', `${FM(`${F('F<sub>1</sub>', 'S<sub>1</sub>')} = ${F('F<sub>2</sub>', 'S<sub>2</sub>')}`)} → 400 N ile 10 000 N\'luk araba kaldırılır (25 kat).`] } },
    { k: { tur: 'dikkat', b: 'Kuvvetten kazanç, yoldan kayıp', f: ['bsA', 'bsB'], m: ['Sıvının hacmi değişmez: S<sub>1</sub> · x<sub>1</sub> = S<sub>2</sub> · x<sub>2</sub> → 50 cm iniş, yalnız <em>2 cm</em> çıkış.', 'Yapılan iş aynıdır (400 · 0,5 = 10 000 · 0,02 = 200 J): hidrolik makine enerji kazandırmaz.'] } },
    { do: S => md(S, 'akis', { hiz: 1 }), sub: 'Eve dönerken hortumun ucunu sıktı: su daha hızlı ve uzağa fışkırdı. Laboratuvarda daralan bir cam boruya üç ince boru taktı.', wait: 3 },
    { p: { t: 'Borunun dar kısmındaki manometre borusunda su seviyesi diğerlerine göre nasıldır?', o: ['Daha yüksek', 'Daha alçak', 'Aynı', 'Su hiç çıkmaz'], d: 1 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Hızın büyük olduğu yerde basınç küçük', f: ['bsv0', 'bsv1', 'bsK'], m: ['Dar kesitte su hızlanır (kesit yarıçapı yarıya inince hız 4 katı). Hızlanan akışkanın basıncı düşer: orta borudaki su <em>alçak</em>.', 'Neden? Akışkan hızlanırken enerjisinin bir kısmı hıza harcanır; duvara yaptığı basınç azalır (Bernoulli ilkesi).'] } },
    { k: { tur: 'gunluk', b: 'Bernoulli günlük hayatta', m: ['Uçak kanadının üstünde hava hızlı, altında yavaş akar: alttaki basınç büyük → kaldırma.', 'Fırtınada çatı uçar, açık camdan perde dışarı çıkar, yanından hızlı tren geçen kişi trene doğru çekilir.'] } },
    { do: S => md(S, 'gaz', { irt: 0, gazP: 86 }), sub: 'Yaz tatilinde Ece ailesiyle deniz kenarından dağa çıktı. Yanında bir cıvalı barometre vardı.', wait: 2 },
    { k: { tur: 'kavram', b: 'Açık hava basıncı (Torricelli)', f: ['bsA'], m: ['Atmosferin ağırlığı her yere basınç yapar. Torricelli, cıvalı tüpte cıvanın deniz seviyesinde <em>76 cm</em> yükseldiğini buldu: P<sub>0</sub> = 76 cmHg ≈ 10<sup>5</sup> Pa.', 'Tüp eğilse ya da kalınlaşsa da düşey cıva yüksekliği değişmez.'] } },
    { do: S => { S.irt = 1000; }, sub: '1000 metreye çıktılar…', wait: 2.5 },
    { do: S => { S.irt = 2000; }, sub: '2000 metreye çıktılar…', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yükseldikçe açık hava basıncı azalır', f: ['bsA', 'bsK'], m: ['Üstümüzdeki hava sütunu kısaldıkça basınç azalır: 76 → 67 → 60 cmHg.', 'Bu yüzden dağda su 100 °C\'nin altında kaynar ve kulaklarımız tıkanır.'] } },
    { k: { tur: 'kavram', b: 'Kapalı kaptaki gaz basıncı', f: ['bsB'], m: ['Gaz tanecikleri kabın çeperine çarparak her yöne basınç yapar.', `Açık uçlu manometrede: ${FM('P<sub>gaz</sub> = P<sub>0</sub> + Δh')} (gaz tarafı alçaksa). Deniz seviyesinde Δh = 10 cm → P<sub>gaz</sub> = 86 cmHg.`] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['U borusu: h<sub>1</sub>d<sub>1</sub> = h<sub>2</sub>d<sub>2</sub> · Pascal: ' + FM(`${F('F<sub>1</sub>', 'S<sub>1</sub>')} = ${F('F<sub>2</sub>', 'S<sub>2</sub>')}`), 'Bernoulli: hız büyük → basınç küçük · P<sub>0</sub> = 76 cmHg, yükseklikle azalır.'] } },
  ] });

  // ======================= HİKÂYE 3 · KALDIRMA KUVVETİ =======================
  const h3 = ders(sBs, { yk: 'TYT8-d4', no: 4, icon: '📖', name: 'Hikâye: Taş batar, tahta yüzer, balık askıda', task: 'Kaldırma kuvveti, dinamometreyle ölçme, yüzme–askıda kalma–batma, batan hacim oranı.', notlar: ['Kaldırma kuvveti cisme sıvı tarafından yukarı doğru uygulanır; büyüklüğü taşırılan sıvının ağırlığına eşittir.', 'Kaldırma kuvveti cismin özkütlesine değil, batan hacmine ve sıvının özkütlesine bağlıdır.'], steps: [
    { do: S => md(S, 'kald', { cis: 'demir', ind: 0 }), sub: 'Ece, havuzda ağır bir taşı su içindeyken kolayca kaldırabildiğini fark etti. Laboratuvarda bunu ölçmeye karar verdi.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Havada ölçüm', f: ['bsT', 'bsG'], m: ['1 L hacimli metal blok dinamometreye asıldı: 30 N gösteriyor. Havadayken ip gerilmesi T = G = 30 N.'] } },
    { p: { t: 'Blok tamamen suya batırılırsa dinamometre kaç N gösterir?', o: ['30 N', '20 N', '40 N', '0'], d: 1 } },
    { sub: 'Bloğu yavaşça suya indirelim.', go: '▶︎ İndir' },
    { do: S => { S.kos = 1; }, sub: 'Blok batıyor; dinamometre değeri azalıyor, su seviyesi yükseliyor…', until: S => S.ind >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kaldırma kuvveti', f: ['bsF', 'bsT', 'bsG'], m: ['Dinamometre 20 N gösterdi: su bloğu <em>10 N</em> ile yukarı itiyor.', `${FM('F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g')} = 0,001 · 1000 · 10 = 10 N`, 'Neden? Bloğun alt yüzü üst yüzünden daha derinde: alttan gelen sıvı basıncı daha büyük, farkı yukarı doğru net kuvvettir.'] } },
    { k: { tur: 'dikkat', b: 'UYARI', m: ['Tamamen batan cisim daha derine indirilse de F<sub>k</sub> <em>değişmez</em> (batan hacim aynı).', 'Kaldırma kuvveti cismin ağırlığına ya da özkütlesine bağlı değildir; batan hacim ve sıvının özkütlesine bağlıdır.', 'Taşma kabında taşan suyun ağırlığı F<sub>k</sub>\'ya eşittir (Arşimet).'] } },
    { do: S => md(S, 'kald', { cis: 'tahta', ind: 0 }), sub: 'Şimdi aynı hacimde tahta blok (d = 0,6 g/cm³) suya bırakılıyor.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Tahta yüzüyor…', until: S => S.ind >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yüzme', f: ['bsF', 'bsG'], m: ['Yüzen cisimde F<sub>k</sub> = G = 6 N.', `Batan hacim oranı: ${FM(`${F('V<sub>batan</sub>', 'V')} = ${F('d<sub>cisim</sub>', 'd<sub>sıvı</sub>')}`)} = 0,6 → hacminin %60\'ı suda.`] } },
    { do: S => md(S, 'kald', { cis: 'askida', ind: 0 }), sub: 'Son olarak özkütlesi suyunkine eşit bir cisim bırakılıyor.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Cisim batıp nerede bırakılırsa orada kalıyor…', until: S => S.ind >= 1 },
    { k: { tur: 'kavram', b: 'Yüzer mi, askıda mı, batar mı?', m: ['d<sub>cisim</sub> < d<sub>sıvı</sub> → <em>yüzer</em> (F<sub>k</sub> = G, bir kısmı dışarıda)', 'd<sub>cisim</sub> = d<sub>sıvı</sub> → <em>askıda</em> (F<sub>k</sub> = G, tamamı içeride)', 'd<sub>cisim</sub> > d<sub>sıvı</sub> → <em>batar</em> (F<sub>k</sub> < G, tabana değerse tabandan da tepki alır)'] } },
    { k: { tur: 'gunluk', b: 'Günlük hayatta', m: ['Balık yüzme kesesini şişirip söndürerek ortalama özkütlesini ayarlar, denizaltı balast tanklarına su alır.', 'Gemi demirden yapılsa da içi boş olduğu için ortalama özkütlesi sudan küçüktür; tuzlu suda daha az batar.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('F<sub>k</sub> = V<sub>batan</sub> d<sub>sıvı</sub> g')} · sıvı içinde dinamometre: ${FM('T = G − F<sub>k</sub>')}`, 'Yüzen: batan oran = d<sub>c</sub>/d<sub>s</sub> · askıda: d<sub>c</sub> = d<sub>s</sub> · batan: d<sub>c</sub> > d<sub>s</sub>'] } },
  ] });

  // ======================= SORU SİSTEMLERİ (kitaptaki bütün soru çeşitleri) =======================
  const s1 = gorev(sBs, { yk: 'TYT8-g2', no: 2, icon: '🧱', name: 'Soru sistemi: katı ve sıvı basıncı', task: 'Tuğla ve sünger, üç kap, musluk grafikleri, karışmayan sıvılar, basınç kuvveti ile ağırlık.', notlar: [...NT.kati, ...NT.sivi], steps: [
    { do: S => md(S, 'kati', { o: 0, ust: 0 }), sub: '20 N ağırlığındaki tuğla süngerin üstünde.', go: '▶︎ Başlat' },
    { do: S => md(S, 'kati', { o: 0, ust: 0, dongu: 0, kes: 0 }), q: { gizle: ['bsK'], goster: S => { S.dongu = 1; S.t = 0; }, t: '20 N\'luk tuğla 0,02 m², 0,01 m² ve 0,005 m²\'lik yüzleri üzerine konuluyor. Süngere uyguladığı basınç kuvvetleri F ve basınçlar P için hangisi doğrudur?', o: ['F\'ler eşit; P en küçük yüzde en büyüktür', 'F ve P üç konumda eşittir', 'F en küçük yüzde en büyüktür; P\'ler eşit', 'P en büyük yüzde en büyüktür'], f: ['bsK', 'bsG'],
      s: ['Basınç kuvveti ağırlıktır: F = 20 N, üçünde eşit.', 'P = F / S → S küçüldükçe P büyür: 1000, 2000, <em>4000 Pa</em> ✓'], n: ['Kuvvet ile basıncı karıştırmamak gerekir: kuvvet aynı kalabilir, basınç alanla değişir.'] } },
    { do: S => md(S, 'kati', { o: 2, ust: 0, dongu: 0, kes: 0 }), q: { gizle: ['bsK'], goster: S => { S.ust = 1; }, t: 'Dik duran tuğlanın (S = 0,005 m²) üstüne özdeş bir tuğla daha konursa süngere yapılan basınç kaç Pa olur?', o: ['8000', '4000', '2000', '16 000'], f: ['bsK'],
      s: ['G = 40 N, S = 0,005 m²', `P = ${F('40', '0,005')} = <em>8000 Pa</em> ✓`], n: ['Aynı yüzeyde ağırlık 2 katına çıkınca basınç da 2 katına çıkar.'] } },
    { do: S => md(S, 'kati', { o: 0, ust: 0, dongu: 0, kes: 0 }), q: { gizle: ['bsK'], goster: S => { S.kes = 1; }, t: 'Dik kenarlı düzgün bir tuğla düşey doğrultuda tam ortadan kesilip bir yarısı kaldırılırsa kalan parçanın yere yaptığı basınç ve basınç kuvveti nasıl değişir?', o: ['P değişmez, F yarıya iner', 'P yarıya iner, F değişmez', 'İkisi de yarıya iner', 'İkisi de değişmez'],
      s: ['G yarıya iner → F yarıya iner.', 'S de yarıya iner → P = F / S <em>değişmez</em> ✓'], n: ['Düzgün katılarda P = h · d · g olarak da yazılabilir; h ve d değişmediği için P değişmez.'] } },
    { do: S => md(S, 'sivi', { h: 1.5, dolum: 0, iki: 0, karis: 0 }), q: { gizle: ['bsA', 'bsB', 'bsC'], t: 'Taban alanları eşit üç kapta (düz, ağzı geniş, ağzı dar) 30 cm yüksekliğinde su vardır. Tabandaki su basınçları P<sub>1</sub>, P<sub>2</sub>, P<sub>3</sub> arasındaki ilişki nedir?', o: ['P<sub>1</sub> = P<sub>2</sub> = P<sub>3</sub>', 'P<sub>2</sub> > P<sub>1</sub> > P<sub>3</sub>', 'P<sub>3</sub> > P<sub>1</sub> > P<sub>2</sub>', 'P<sub>1</sub> > P<sub>2</sub> = P<sub>3</sub>'], f: ['bsA', 'bsB', 'bsC'],
      s: ['P = h · d · g; h ve d üçünde aynı.', 'P = 0,3 · 1000 · 10 = 3000 Pa → <em>hepsi eşit</em> ✓'], n: ['Ağzı geniş kapta daha çok su olması basıncı artırmaz.'] } },
    { do: S => md(S, 'sivi', { h: 1.5, dolum: 0, iki: 0, karis: 0 }), q: { gizle: ['bsK'], t: 'Aynı üç kapta suyun tabana uyguladığı kuvvet F ile suyun ağırlığı G için hangisi doğrudur?', o: ['Düz kapta F = G, ağzı geniş kapta F < G, ağzı dar kapta F > G', 'Üçünde de F = G', 'Ağzı geniş kapta F > G, ağzı dar kapta F < G', 'Üçünde de F < G'], f: ['bsK'],
      s: ['F = P · S üç kapta eşit (90 N).', 'Ağırlıklar: düz 90 N, ağzı geniş ≈ 145 N, ağzı dar ≈ 64 N.', 'Ağzı geniş: <em>F < G</em> · ağzı dar: <em>F > G</em> ✓'], n: ['Eğik duvarlar suya dik tepki kuvveti uygular. Ağzı geniş kapta bu tepkinin düşey bileşeni yukarı (suyun bir kısmını duvar taşır); ağzı dar kapta aşağıdır (su tabana daha çok bastırır).'] } },
    { do: S => md(S, 'sivi', { dolum: 1, tt: 0, hs: [0, 0, 0], iz: [[], [], []], iki: 0 }), q: { gizle: ['bsP'], goster: S => { S.kos = 1; }, t: 'Boş kaplar eşit debili musluklarla dolduruluyor. Ağzı geniş kabın tabanındaki basıncın zamana göre grafiği nasıldır?', o: ['Eğimi giderek azalan eğri', 'Doğrusal', 'Eğimi giderek artan eğri', 'Önce artan sonra azalan'], f: ['bsP'],
      s: ['Eşit sürede eşit hacim girer; yukarıda kesit genişledikçe seviye daha yavaş yükselir.', 'P ∝ h olduğundan grafiğin eğimi <em>azalır</em> ✓'], n: ['Ağzı dar kapta tersi olur: eğim artar. Düz kapta doğrusal.'] } },
    { do: S => md(S, 'sivi', { dolum: 0, iki: 1, h: 1.5, karis: 0 }), q: { gizle: ['bsA'], t: 'Düz kapta 20 cm su ve üstünde 10 cm yağ (d = 0,8 g/cm³) vardır. Kap tabanındaki toplam sıvı basıncı kaç Pa\'dır?', o: ['2800', '3000', '2000', '2400'], f: ['bsA'],
      s: ['Yağ: 0,1 · 800 · 10 = 800 Pa', 'Su: 0,2 · 1000 · 10 = 2000 Pa', 'Toplam: <em>2800 Pa</em> ✓'], n: ['Karışmayan sıvılarda her katmanın basıncı üst üste eklenir.'] } },
    { do: S => md(S, 'sivi', { dolum: 0, iki: 1, h: 1.5, karis: 0 }), q: { gizle: ['bsA'], goster: S => { S.karis = 1; }, t: 'Aynı düz kaptaki yağ ve su karıştırılabilseydi kap tabanındaki sıvı basıncı nasıl değişirdi?', o: ['Değişmezdi', 'Artardı', 'Azalırdı', 'Sıfır olurdu'],
      s: ['Düz kapta tabandaki kuvvet sıvıların toplam ağırlığına eşittir; ağırlık ve taban alanı değişmez.', 'P = G / S <em>değişmez</em> ✓'], n: ['Ağzı geniş ya da dar kaplarda bu sonuç geçerli olmayabilir; çünkü F, G\'ye eşit değildir.'] } },
    { q: { t: 'Barajların duvarları için;<br>I. Tabana doğru kalınlaşır.<br>II. Duvara etki eden su basıncı derinlikle artar.<br>III. Su basıncı barajın genişliğine bağlıdır.<br>yargılarından hangileri doğrudur?', o: ['I ve II', 'Yalnız I', 'I ve III', 'I, II ve III'],
      s: ['P = h d g: basınç derinlikle artar (II). Bu yüzden duvar tabanda kalındır (I).', 'Basınç gölün genişliğine ya da su miktarına bağlı değildir (III yanlış). <em>I ve II</em> ✓'], n: ['Dalgıç kıyafetleri ve denizaltılar da aynı nedenle derinlik için güçlendirilir.'] } },
  ] });
  const s2 = gorev(sBs, { yk: 'TYT8-g3', no: 3, icon: '🧪', name: 'Soru sistemi: U borusu, hidrolik, akış, gaz', task: 'U borusunda seviye farkı, birleşik kaplar, hidrolik lift, Bernoulli, açık hava ve gaz basıncı.', steps: [
    { do: S => md(S, 'ubor', { yag: 0, yagH: 1.5 }), sub: 'U borusunda su.', go: '▶︎ Başlat' },
    { do: S => md(S, 'ubor', { yag: 0, yagH: 1.5 }), q: { gizle: ['bsA', 'bsB', 'bsC'], goster: S => { S.kos = 1; }, t: 'U borusunun sol koluna su ile karışmayan 15 cm yüksekliğinde sıvı (d = 0,8 g/cm³) dökülüyor. Sağ kolda, sınır düzleminin üstündeki su sütunu kaç cm olur?', o: ['12', '15', '18,75', '8'], f: ['bsA', 'bsB'],
      s: ['Sınır düzleminde basınçlar eşit: 15 · 0,8 = h · 1', '<em>h = 12 cm</em> ✓'], n: ['Az yoğun sıvının sütunu daha uzun olur.'] } },
    { do: S => md(S, 'ubor', { yag: 1, yagH: 1.5 }), q: { gizle: ['bsB', 'bsC'], t: 'Aynı durumda sağ koldaki su seviyesi başlangıçtaki seviyesine göre kaç cm yükselmiştir? (Kolların kesitleri eşit)', o: ['6', '12', '3', '15'], f: ['bsB'],
      s: ['Sınır sol kolda x iner, sağda su x yükselir: sınırın üstündeki su 2x = 12 cm', '<em>x = 6 cm</em> ✓'], n: ['Kesitler eşitse bir kolda inen sıvı kadar öteki kolda çıkar.'] } },
    { do: S => md(S, 'hid', { itis: 0, s1: 0.02, s2: 0.5, mk: 1200, x1: 75 }), q: { gizle: ['bsT', 'bsK'], goster: S => { S.kos = 1; }, t: 'Hidrolik liftte küçük pistonun alanı 0,02 m², büyük pistonun alanı 0,5 m²\'dir. 1200 kg\'lık aracı dengede tutmak için küçük pistona kaç N kuvvet uygulanmalıdır?', o: ['480', '12 000', '300', '600'], f: ['bsK'],
      s: [`${F('F<sub>1</sub>', '0,02')} = ${F('12 000', '0,5')}`, 'F<sub>1</sub> = 12 000 · 0,04 = <em>480 N</em> ✓'], n: ['Pistonlar aynı yükseklikte değilse yükseklik farkının sıvı basıncı da hesaba katılır.'] } },
    { do: S => md(S, 'hid', { itis: 0, s1: 0.02, s2: 0.5, mk: 1200, x1: 75 }), q: { gizle: ['bsB'], goster: S => { S.kos = 1; }, t: 'Aynı lifte küçük piston 75 cm itilirse araç kaç cm yükselir?', o: ['3', '75', '30', '1,5'], f: ['bsA', 'bsB'],
      s: ['S<sub>1</sub> x<sub>1</sub> = S<sub>2</sub> x<sub>2</sub>: 0,02 · 75 = 0,5 · x<sub>2</sub>', '<em>x<sub>2</sub> = 3 cm</em> ✓'], n: ['İş korunur: F<sub>1</sub> · x<sub>1</sub> = F<sub>2</sub> · x<sub>2</sub>.'] } },
    { do: S => md(S, 'akis', { hiz: 0.0001 }), q: { gizle: ['bsK', 'bsv0', 'bsv1', 'bsv2'], goster: S => { S.hiz = 1; }, t: 'Su, kesiti daralan yatay borudan akıyor. Dar kısımda suyun hızı ve basıncı geniş kısma göre nasıldır?', o: ['Hız büyük, basınç küçük', 'Hız küçük, basınç büyük', 'İkisi de büyük', 'İkisi de aynı'], f: ['bsv0', 'bsv1'],
      s: ['Birim zamanda geçen hacim aynı: A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub> → dar kısımda <em>hız büyük</em>.', 'Bernoulli: hızın büyük olduğu yerde <em>basınç küçük</em> ✓'], n: ['Manometre borusundaki su yüksekliği o noktadaki basıncı gösterir.'] } },
    { q: { t: 'I. Fırtınada çatıların uçması<br>II. Hızlı geçen kamyonun yanındaki bisikletlinin kamyona doğru çekilmesi<br>III. Suya bırakılan tahtanın yüzmesi<br>olaylarından hangileri akışkanların hızı ile basıncı arasındaki ilişkiyle açıklanır?', o: ['I ve II', 'Yalnız I', 'I ve III', 'I, II ve III'],
      s: ['I ve II: hızlanan hava bölgesinde basınç düşer → Bernoulli.', 'III kaldırma kuvvetidir. <em>I ve II</em> ✓'], n: ['Uçak kanadı, parfüm pompası, Bunsen beki de Bernoulli örnekleridir.'] } },
    { do: S => md(S, 'gaz', { irt: 0, gazP: 90 }), q: { gizle: ['bsK'], t: 'Deniz seviyesinde (P<sub>0</sub> = 76 cmHg) kapalı bir kaba bağlı açık uçlu cıvalı manometrede cıva, açık kolda gaz tarafından 14 cm daha yüksektedir. Gazın basıncı kaç cmHg\'dir?', o: ['90', '62', '76', '14'], f: ['bsB'],
      s: ['Gaz tarafındaki cıva yüzeyinden geçen yatay düzlemde basınçlar eşit.', 'P<sub>gaz</sub> = P<sub>0</sub> + 14 = <em>90 cmHg</em> ✓'], n: ['Gaz tarafındaki cıva daha yüksekte olsaydı P<sub>gaz</sub> = P<sub>0</sub> − Δh olurdu.'] } },
    { do: S => md(S, 'gaz', { irt: 0, gazP: 90 }), q: { gizle: ['bsK'], goster: S => { S.irt = 2000; }, t: 'Torricelli deneyi deniz seviyesinden 2000 m yüksekliğe taşınırsa;<br>I. Tüpteki cıva yüksekliği azalır.<br>II. Tüp daha kalın olsaydı cıva yüksekliği değişirdi.<br>III. Açık hava basıncı azalır.<br>yargılarından hangileri doğrudur?', o: ['I ve III', 'Yalnız I', 'I ve II', 'I, II ve III'], f: ['bsA'],
      s: ['Yükseklik arttıkça açık hava basıncı azalır (III) → cıva sütunu kısalır (I).', 'Cıva yüksekliği tüpün kalınlığına bağlı değildir (II yanlış). <em>I ve III</em> ✓'], n: ['Barometre altimetre olarak da kullanılır.'] } },
  ] });
  const s3 = gorev(sBs, { yk: 'TYT8-g4', no: 4, icon: '⚓', name: 'Soru sistemi: kaldırma kuvveti', task: 'Dinamometreyle kaldırma kuvveti, özkütle bulma, kısmen batma, yüzme ve askıda kalma.', steps: [
    { do: S => md(S, 'kald', { cis: 'demir', ind: 0, V: 1.5, indH: 1 }), sub: 'Dinamometreye asılı blok.', go: '▶︎ Başlat' },
    { do: S => md(S, 'kald', { cis: 'demir', ind: 0, V: 1.5, indH: 1 }), q: { gizle: ['bsF', 'bsK'], goster: S => { S.kos = 1; }, t: 'Havada 45 N gösteren dinamometreye asılı cisim tamamen suya batırılınca dinamometre 30 N gösteriyor. Cismin hacmi kaç dm³\'tür? (d<sub>su</sub> = 1 kg/dm³)', o: ['1,5', '3', '4,5', '1'], f: ['bsT', 'bsF'],
      s: ['F<sub>k</sub> = 45 − 30 = 15 N', 'V = F<sub>k</sub> / (d g) = 15 / (1000 · 10) m³ = 0,0015 m³ = <em>1,5 dm³</em> ✓'], n: ['Cisim tamamen battığı için batan hacim cismin hacmidir.'] } },
    { do: S => md(S, 'kald', { cis: 'demir', ind: 1, V: 1.5, indH: 1 }), q: { gizle: ['bsK'], t: 'Aynı cismin özkütlesi kaç g/cm³\'tür?', o: ['3', '1,5', '2', '4,5'], f: ['bsG', 'bsF'],
      s: ['§1. YOL', 'm = 4,5 kg, V = 1,5 dm³ → d = 4,5 / 1,5 = <em>3 g/cm³</em> ✓', '§2. YOL', `${F('d<sub>cisim</sub>', 'd<sub>su</sub>')} = ${F('G', 'F<sub>k</sub>')} = ${F('45', '15')} = 3 → <em>3 g/cm³</em> ✓`], n: ['Tamamen batan cisimde G / F<sub>k</sub> oranı özkütleler oranına eşittir.'] } },
    { do: S => md(S, 'kald', { cis: 'demir', ind: 0, V: 1, indH: 0.767 }), q: { gizle: ['bsT', 'bsF', 'bsK'], goster: S => { S.kos = 1; }, t: 'Havada 30 N gelen 1 dm³\'lük cisim hacminin yarısı suya batacak şekilde tutuluyor. Dinamometre kaç N gösterir?', o: ['25', '20', '15', '30'], f: ['bsT', 'bsF'],
      s: ['F<sub>k</sub> = 0,5 · 0,001 · 1000 · 10 = 5 N', 'T = 30 − 5 = <em>25 N</em> ✓'], n: ['Kaldırma kuvveti batan hacimle doğru orantılıdır.'] } },
    { do: S => md(S, 'kald', { cis: 'tahta', ind: 0, V: 1, dt: 0.7, indH: 1 }), q: { gizle: ['bsK'], goster: S => { S.kos = 1; }, t: 'Özkütlesi 0,7 g/cm³ olan bir tahta blok suda yüzüyor. Hacminin yüzde kaçı su içindedir?', o: ['70', '30', '100', '50'], f: ['bsF', 'bsG'],
      s: [`Yüzen cisimde F<sub>k</sub> = G → ${F('V<sub>batan</sub>', 'V')} = ${F('0,7', '1')}`, '<em>%70</em> ✓'], n: ['Buz (0,92) suda hacminin %92\'si batık yüzer: buzdağının görünen kısmı küçüktür.'] } },
    { do: S => md(S, 'kald', { cis: 'tahta', ind: 1, V: 1, dt: 0.7, indH: 1 }), q: { t: 'Tatlı suda yüzen tahta blok tuzlu suya (d = 1,1 g/cm³) konursa kaldırma kuvveti ve batan hacmi nasıl değişir?', o: ['F<sub>k</sub> değişmez, batan hacim azalır', 'F<sub>k</sub> artar, batan hacim azalır', 'F<sub>k</sub> değişmez, batan hacim artar', 'İkisi de değişmez'],
      s: ['Yine yüzer: F<sub>k</sub> = G <em>değişmez</em>.', 'd<sub>sıvı</sub> arttığından aynı F<sub>k</sub> için daha az hacim batar ✓'], n: ['Gemiler tuzlu denizde tatlı sudakinden daha az batar.'] } },
    { do: S => md(S, 'kald', { cis: 'askida', ind: 0, V: 1, indH: 1 }), q: { goster: S => { S.kos = 1; }, t: 'Su içinde bırakıldığı yerde kalan bir cisim için;<br>I. Özkütlesi suyun özkütlesine eşittir.<br>II. Kaldırma kuvveti ağırlığına eşittir.<br>III. Daha derine indirilirse kaldırma kuvveti artar.<br>yargılarından hangileri doğrudur?', o: ['I ve II', 'Yalnız I', 'I ve III', 'I, II ve III'], f: ['bsF', 'bsG'],
      s: ['Askıda kalma: d<sub>c</sub> = d<sub>s</sub> (I) ve F<sub>k</sub> = G (II).', 'Tamamen batmış cisimde batan hacim değişmez → F<sub>k</sub> derinlikle değişmez (III yanlış). <em>I ve II</em> ✓'], n: ['Basınç derinlikle artar ama alt ve üst yüzey arasındaki basınç farkı değişmez.'] } },
  ] });
  FZ.konuEk('TYT', 'Basınç ve Kaldırma Kuvveti', { dersler: [h1, h2, h3], gorevler: [s1, s2, s3] });
  const t1 = gorev(sBs, { yk: 'TYT8-g5', no: 5, tuzak: true, icon: '🪤', name: 'Tuzak sorular · basınç ve kaldırma', task: 'Basınç ve kaldırma kuvvetinde en sık yapılan yanlışlar.', steps: [
    { do: S => md(S, 'sivi', { h: 1.5, dolum: 0, iki: 0 }), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: 'Taban alanları eşit, ağzı geniş ve ağzı dar iki kapta aynı yükseklikte su var. Ağzı geniş kapta daha çok su olduğuna göre tabandaki basınçlar için hangisi doğrudur?', o: ['Eşittir', 'Ağzı geniş kapta büyüktür', 'Ağzı dar kapta büyüktür', 'Su miktarıyla orantılıdır'], f: ['bsA', 'bsB'],
      s: ['P = h d g → yalnız derinlik ve özkütle → <em>eşit</em> ✓'], n: ['TUZAK: "Çok su, çok basınç" sanmak.'] } },
    { do: S => md(S, 'sivi', { h: 1.5, dolum: 0, iki: 0 }), q: { gizle: ['bsK'], t: 'Ağzı dar bir kaptaki suyun tabana uyguladığı kuvvet için hangisi doğrudur?', o: ['Suyun ağırlığından büyüktür', 'Suyun ağırlığına eşittir', 'Suyun ağırlığından küçüktür', 'Sıfırdır'], f: ['bsK'],
      s: ['F = P · S; kabın yan duvarları suyu aşağı iter → <em>F > G</em> ✓'], n: ['TUZAK: her kapta F = G sanmak; yalnız düz kapta eşit.'] } },
    { do: S => md(S, 'kald', { cis: 'demir', ind: 0.85, V: 1, indH: 1 }), q: { goster: S => { S.kos = 1; }, t: 'Tamamen suya batmış bir taş daha derine indirilirse kaldırma kuvveti nasıl değişir?', o: ['Değişmez', 'Artar', 'Azalır', 'Önce artar sonra azalır'], f: ['bsF'],
      s: ['F<sub>k</sub> = V<sub>batan</sub> d g; batan hacim değişmez → <em>değişmez</em> ✓'], n: ['TUZAK: basınç arttığı için kaldırma kuvveti de artar sanmak. Basınç artar ama alt–üst farkı aynı kalır.'] } },
    { q: { t: 'Aynı hacimli demir ve tahta bloklar tamamen suya batırılıp tutuluyor. Kaldırma kuvvetleri için hangisi doğrudur?', o: ['Eşittir', 'Demirde büyüktür', 'Tahtada büyüktür', 'Ağırlıklarına eşittir'],
      s: ['İkisinin de batan hacmi aynı → <em>eşit</em> ✓'], n: ['TUZAK: kaldırma kuvvetinin cismin ağırlığına ya da maddesine bağlı olduğunu sanmak.'] } },
    { do: S => md(S, 'akis', { hiz: 0.0001 }), q: { gizle: ['bsK'], goster: S => { S.hiz = 1; }, t: 'Kesiti daralan bir borudan akan suyun dar kısımdaki basıncı için hangisi doğrudur?', o: ['Küçüktür', 'Büyüktür', 'Aynıdır', 'Sıfırdır'], f: ['bsv1'],
      s: ['Dar kısımda hız büyük → basınç <em>küçük</em> ✓'], n: ['TUZAK: sıkışan yerde basınç artar sanmak (Bernoulli tersini söyler).'] } },
    { do: S => md(S, 'kati', { o: 0, ust: 0, kes: 0, dongu: 0 }), q: { gizle: ['bsK'], goster: S => { S.kes = 1; }, t: 'Masadaki dik kenarlı düzgün bir tuğla düşey olarak tam ortadan kesilip bir yarısı alınırsa masaya yapılan basınç ne olur?', o: ['Değişmez', 'Yarıya iner', 'İki katına çıkar', 'Dörtte birine iner'], f: ['bsK'],
      s: ['G ve S birlikte yarıya iner → P = G/S <em>değişmez</em> ✓'], n: ['TUZAK: ağırlık azaldı diye basınç azalır sanmak.'] } },
  ] });
  FZ.konuEk('TYT', 'Basınç ve Kaldırma Kuvveti', { gorevler: [t1] });
})();
