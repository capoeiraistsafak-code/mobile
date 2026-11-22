// Animasyon programı · Elektrostatik Laboratuvarı: sürtünme ile elektriklenme (triboelektrik sıra), çubukla kâğıt kaldırma,
// etki ile elektriklenme + topraklama, elektroskop, içi boş iletken (Faraday kabı) · AYT: elektrik alan çizgileri, Coulomb q₃
(function () {
  const { V3, sahne, gorev, ders, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const ARTI = 0xef4444, EKSI = 0x2563eb;
  const isaret = n => n === 0 ? '0' : (n > 0 ? '+' : '−') + Math.abs(n) + 'q';
  const havuz = (g, n, r = 0.075) => { const a = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), new THREE.MeshBasicMaterial({ color: ARTI })); m.visible = false; g.add(m); a.push(m); } return a; };
  // yumuşak konum: hedefe doğru kay
  const kay = (m, p, dt, h = 10) => { if (!m.visible) { m.position.copy(p); m.visible = true; } else m.position.lerp(p, Math.min(1, dt * h)); };
  const yukCiz = (h, L, dt) => h.forEach((m, i) => { const y = L[i]; if (!y) { m.visible = false; return; } m.material.color.setHex(y.s > 0 ? ARTI : EKSI); kay(m, y.p, dt); });
  const cember = (c, R, n, a0, a1, z = 0.05) => Array.from({ length: n }, (_, i) => { const a = n === 1 ? (a0 + a1) / 2 : a0 + (a1 - a0) * i / (n - 1); return V3(c.x + R * Math.cos(a), c.y + R * Math.sin(a), c.z + z); });
  const yatay = (g, L, r, renk, x, y, z, ops) => { const m = silindir(g, r, r, L, renk, x, y, z, ops); m.rotation.z = Math.PI / 2; return m; };

  // Elektroskop modeli: cam fanus, metal çubuk, topuz, iki yaprak (yaprak açısı dışarıdan verilir)
  const elektroskop = (g, x) => { const e = new THREE.Group(); e.position.set(x, 0, 0); g.add(e);
    kutu(e, 1.5, 0.12, 1.1, 0x334155, 0, 0.06, 0);
    const fan = new THREE.Mesh(new THREE.LatheGeometry([[0.6, 0], [0.62, 0.9], [0.55, 1.3], [0.32, 1.5], [0.2, 1.58]].map(([a, b]) => new THREE.Vector2(a, b)), 28), new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.22, shininess: 100, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false })); fan.position.y = 0.12; e.add(fan);   // cam fanus
    silindir(e, 0.2, 0.17, 0.16, 0x92400e, 0, 1.7, 0, { edge: false });            // mantar tıpa (yalıtkan)
    const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.35, 10), FZ.metal()); cb.position.set(0, 1.45, 0); e.add(cb);
    const topuz = FZ.metalTop(e, 0.2, 0, 2.2, 0);
    const pv = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(0, 0.95, 0.02); e.add(p);
      const y = kutu(p, 0.17, 0.8, 0.015, 0xfbbf24, s * 0.06, -0.4, 0, { edge: false }); /* altın varak yaprak */ y.material.emissive = new THREE.Color(0x92400e); y.material.emissiveIntensity = 0.3; p.s = s; return p; });
    e.aci = 0; e.topuz = topuz;
    e.yaprakNokta = (s, d) => V3(x + s * (Math.sin(e.aci) * d + 0.06 * Math.cos(e.aci)), 0.95 - Math.cos(e.aci) * d, 0.1);
    e.ayarla = (q, dt) => { const hedef = Math.min(0.95, Math.abs(q) * 0.16); e.aci += (hedef - e.aci) * Math.min(1, dt * 3); pv.forEach(p => p.rotation.z = p.s * e.aci); };
    return e; };
  // Elektroskop yük noktaları: knob ve yapraklar
  const eskYuk = (e, x, qTop, qYap) => { const L = [], nT = Math.round(Math.abs(qTop)), nY = Math.round(Math.abs(qYap)), sT = Math.sign(qTop), sY = Math.sign(qYap);
    cember(V3(x, 2.2, 0), 0.24, nT, Math.PI * 0.15, Math.PI * 0.85, 0.12).forEach(p => L.push({ p, s: sT }));
    for (let i = 0; i < nY; i++) { const s = i % 2 ? 1 : -1, k = Math.floor(i / 2); L.push({ p: e.yaprakNokta(s, 0.3 + (k % 4) * 0.13), s: sY }); }
    return L; };

  // =====================================================================
  // ELEKTROSTATİK LABORATUVARI (4 bölüm tek sahnede)
  // =====================================================================
  const CIFT = [['Ebonit', 'Yün', -1, 0x1f2937, 0xe7d3a8], ['Cam', 'İpek', 1, 0x93c5fd, 0xf5f5f4], ['Plastik tarak', 'Saç', -1, 0x7c3aed, 0x92400e]];
  const KAG = Array.from({ length: 9 }, (_, i) => ({ x: 0.55 + (i % 5) * 0.42, z: i < 5 ? 0.25 : -0.25, d: 0.15 * i, it: i % 3 === 0 }));
  const sLab = sahne({ icon: '⚡', cam: [[1, 3.4, 12.5], [1, 1.5, 0]], plate: [12, 5, 0, 0],
    cam2: S => S.mod === 'faraday' ? [[0.9, 6.2, 10], [0.9, 1.7, 0]] : S.mod === 'elskop' ? [[0.9, 3.0, 10.5], [0.9, 2.5, 0]] : [[1, 3.4, 12.5], [1, 1.5, 0]],
    data: [['Kırmızı nokta', '(+) yük'], ['Mavi nokta', '(−) yük']],
    S0: () => ({ mod: 'surt', ci: 0, n: 0, surt: 0, yak: 0, kag: 0, ea: 0, ak: 0, eq: 0, cub: 1, ey: 0, fz: 0, sen: 'A', fkos: 0 }),
    kur(g) {
      const G = {}; ['surt', 'etki', 'elskop', 'faraday'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      // --- sürtünme ---
      const cubuk = yatay(G.surt, 2.4, 0.1, 0x1f2937, -1.2, 1.8, 0, { edge: false });
      const bez = kutu(G.surt, 0.55, 0.42, 0.42, 0xe7d3a8, -1.2, 1.8, 0, { edge: false });
      const kag = KAG.map(k => kutu(G.surt, 0.22, 0.012, 0.16, 0xffffff, k.x, 0.01, k.z, { edge: false }));
      // --- etki + topraklama ---
      const kure = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 20), FZ.metal(0xc0c7d1, 0.6)); kure.position.set(-0.3, 1.5, 0); G.etki.add(kure);   // metal küre (yükler görünsün diye yarı saydam)
      FZ.yalitkanAyak(G.etki, -0.3, 0.78);
      const ecubuk = yatay(G.etki, 2, 0.1, 0x1f2937, -4, 1.5, 0, { edge: false });
      const tel = FZ.cizgi(G.etki, 0x16a34a); tel.material.dashSize = 100; tel.material.gapSize = 0;
      const toprak = new THREE.Group(); toprak.position.set(1.5, 0.05, 0); G.etki.add(toprak); [0.5, 0.34, 0.18].forEach((w, i) => kutu(toprak, w, 0.04, 0.04, 0x16a34a, 0, -i * 0.1 + 0.2, 0, { edge: false }));
      // --- elektroskop + çubuk ---
      const esk = elektroskop(G.elskop, 0.3);
      const scubuk = silindir(G.elskop, 0.1, 0.1, 1.6, 0x1f2937, 0.3, 4.6, 0, { edge: false });   // çubuk yukarıdan topuza iner
      // --- Faraday kabı ---
      const FK = V3(-0.45, 1.7, 0), R = 1;
      const kap = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 24, 0, Math.PI * 2, 0.42, Math.PI - 0.42), new THREE.MeshPhongMaterial({ color: 0xb8c0cc, specular: 0xffffff, shininess: 90, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }));
      kap.position.copy(FK); G.faraday.add(kap);
      const ickap = new THREE.Mesh(new THREE.SphereGeometry(R * 0.94, 32, 20, 0, Math.PI * 2, 0.45, Math.PI - 0.45), new THREE.MeshPhongMaterial({ color: 0x8a94a3, transparent: true, opacity: 0.25, side: THREE.BackSide, depthWrite: false })); ickap.position.copy(FK); G.faraday.add(ickap);   // kabuğun iç yüzeyi (kalınlık)
      const agiz = new THREE.Mesh(new THREE.TorusGeometry(R * Math.sin(0.43), 0.035, 8, 32), FZ.metal()); agiz.rotation.x = Math.PI / 2; agiz.position.set(FK.x, FK.y + R * Math.cos(0.43), 0); G.faraday.add(agiz);   // ağız kenarı
      FZ.yalitkanAyak(G.faraday, FK.x, FK.y - R + 0.02);
      const fesk = elektroskop(G.faraday, 1.9);
      const ftel = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(FK.x + R * 0.98, FK.y + 0.1, 0), V3(0.6, 2.75, 0), V3(1.9, 2.42, 0)]), 30, 0.025, 6), new THREE.MeshPhongMaterial({ color: 0xb45309, shininess: 60 })); G.faraday.add(ftel);   // bakır bağlantı teli
      const prob = new THREE.Group(); G.faraday.add(prob); FZ.metalTop(prob, 0.16, 0, 0, 0); const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7, shininess: 80 })); sap.position.y = 1.0; prob.add(sap);   // deneme küresi: metal küre, yalıtkan sap
      const yuk = havuz(g, 40);
      kart('esT', '', '#F5C400'); etiket('esA', '', '#1f2937'); etiket('esB', '', '#1f2937'); etiket('esC', '', '#1f2937');
      kart('esL', '<span style="color:#ef4444">●</span> (+) yük &nbsp; <span style="color:#2563eb">●</span> (−) yük', '#475569');
      return { G, cubuk, bez, kag, kure, ecubuk, tel, toprak, esk, scubuk, FK, R, kap, fesk, prob, yuk };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      const L = [];
      if (S.mod === 'surt') {
        const [cad, bad, cs, cr, br] = CIFT[S.ci];
        o.cubuk.material.color.setHex(cr); o.cubuk.material.transparent = S.ci === 1; o.cubuk.material.opacity = S.ci === 1 ? 0.6 : 1; o.bez.material.color.setHex(br);
        if (S.surt) { S.n = Math.min(6, S.n + dt * 1.6); if (S.n >= 6) S.surt = 0; }
        if (S.yak > 0 && S.yak < 1) S.yak = Math.min(1, S.yak + dt * 0.6);
        const q = FZ.ease(S.yak), cx = -1.2 + q * 2.6, cy = 1.8 - q * 0.75; o.cubuk.position.set(cx, cy, 0);
        o.bez.visible = S.yak === 0; o.bez.position.set(-1.2 + (S.surt ? Math.sin(S.t * 9) * 0.9 : 0.9), 1.8, 0);
        const n = Math.floor(S.n);
        for (let i = 0; i < n; i++) L.push({ p: V3(cx - 1 + i * 0.4, cy + 0.13, 0.06), s: cs });
        if (S.yak === 0) for (let i = 0; i < n; i++) L.push({ p: V3(o.bez.position.x - 0.2 + (i % 3) * 0.2, 1.8 + (i < 3 ? 0.12 : -0.12), 0.23), s: -cs });
        if (S.yak >= 1) S.kag += dt;
        o.kag.forEach((m, i) => { const k = KAG[i], t = S.kag - k.d, ust = cy - 0.12;
          let y = 0.01, x = k.x;
          if (S.yak >= 1 && t > 0) { y = 0.01 + (ust - 0.01) * FZ.ease(Math.min(1, t / 0.35)); x = k.x + (cx - k.x) * 0.0;
            if (k.it && t > 1.4) { const u = Math.min(1, (t - 1.4) / 0.6); y = ust - (ust - 0.01) * FZ.ease(u); x = k.x + (k.x < cx ? -1 : 1) * 0.6 * u; L.push({ p: V3(x, y + 0.06, k.z + 0.05), s: cs }); } }
          m.position.set(x, y, k.z); m.rotation.z = y > 0.05 ? Math.sin(S.t * 6 + i) * 0.25 : 0; });
        FZ.setTag('esA', `${cad} ${n ? (cs > 0 ? '(+)' : '(−)') : 'nötr'}`); FZ.show('esA', V3(cx + 0.2, cy + 0.6, 0), 1);
        FZ.setTag('esB', `${bad} ${n ? (cs > 0 ? '(−)' : '(+)') : 'nötr'}`); FZ.show('esB', V3(1.2, 1.8, 0), S.yak === 0 ? 1 : 0);
        FZ.setTag('esT', S.yak >= 1 ? 'Nötr kâğıt kutuplanır → çekilir · dokunan kâğıt yük alır → itilir' : n ? `Sürtünme: ${cad} ${cs > 0 ? '+' : '−'}, ${bad} ${cs > 0 ? '−' : '+'} (eşit miktarda)` : 'Çubuk ve kumaş başta nötr');
        FZ.show('esT', V3(0.4, 3.3, 0), 1);
      } else if (S.mod === 'etki') {
        // ea: 0 nötr · 1 çubuk yakın · 2 toprak bağlı · 3 toprak kesildi · 4 çubuk uzak
        const yak = S.ea >= 1 && S.ea < 4 ? 1 : 0; S.ey += ((yak ? 1 : 0) - S.ey) * Math.min(1, dt * 2.5);
        o.ecubuk.position.x = -4 + S.ey * 2.25;
        if (S.ea === 2) S.ak = Math.min(1, S.ak + dt * 0.7); else if (S.ea > 2) S.ak = 1;
        const C = o.kure.position, nKal = S.ea >= 2 ? 3 : 6;
        cember(C, 0.79, 6, 0, Math.PI * 2 * 5 / 6).forEach(p => L.push({ p, s: 1 }));   // protonlar yerinde (eşit dağılmış + yük)
        const sag = S.ey > 0.5 ? cember(C, 0.8, nKal, -0.9, 0.9, 0.12) : cember(C, 0.8, nKal, 0.5, 0.5 + Math.PI * 2 * (nKal - 1) / nKal, 0.12);
        sag.forEach(p => L.push({ p, s: -1 }));
        if (S.ea >= 2) for (let i = 0; i < 3; i++) { const u = Math.min(1, S.ak * 1.4 - i * 0.2); if (u <= 0) { L.push({ p: cember(C, 0.8, 1, 0, 0, 0.12)[0], s: -1 }); continue; }
          if (u >= 1) continue;   /* toprağa ulaşan elektron toprakta kaybolur */
          const yol = [V3(C.x + 0.8, C.y, 0.12), V3(1.5, C.y, 0.12), V3(1.5, 0.2, 0.12)], s2 = u * 2, sg = Math.min(1, Math.floor(s2));
          L.push({ p: yol[sg].clone().lerp(yol[sg + 1], s2 - sg), s: -1 }); }
        for (let i = 0; i < 5; i++) L.push({ p: V3(o.ecubuk.position.x - 0.8 + i * 0.4, 1.63, 0.06), s: -1 });
        o.tel.visible = S.ea === 2; if (S.ea === 2) FZ.setLine(o.tel, [V3(C.x + 0.75, C.y, 0), V3(1.5, C.y, 0), V3(1.5, 0.25, 0)]); o.toprak.visible = true;
        const net = S.ea >= 2 ? 3 : 0;
        FZ.setTag('esA', `Küre: ${net ? '+3q' : 'nötr'}`); FZ.show('esA', V3(C.x, 2.55, 0), 1);
        FZ.setTag('esB', 'Ebonit (−)'); FZ.show('esB', V3(o.ecubuk.position.x, 2.0, 0), S.ey > 0.05 ? 1 : 0);
        FZ.setTag('esC', 'Toprak'); FZ.show('esC', V3(1.5, -0.35, 0.3), 1);
        FZ.setTag('esT', ['Nötr iletken küre (+ ve − eşit)', 'Çubuk (−) elektronları uzak uca iter', 'Toprak bağlandı: elektronlar toprağa akıyor', 'Toprak bağlantısı kesildi', 'Çubuk uzaklaştı: küre (+) yüklü kaldı'][S.ea]);
        FZ.show('esT', V3(0.2, 3.4, 0), 1);
      } else if (S.mod === 'elskop') {
        S.ey += (S.yak - S.ey) * Math.min(1, dt * 1.5);
        o.scubuk.position.set(0.3, 4.55 - S.ey * 1.2, 0); o.scubuk.material.color.setHex(S.cub === 0 ? 0x94a3b8 : S.cub > 0 ? 0x93c5fd : 0x1f2937);
        // yük korunumu: topuz + yapraklar = elektroskobun yükü (eq); yaklaşan çubuk elektronları iter/çeker (etki)
        const c = S.cub * 5, yap = Math.round(S.cub === 0 ? S.eq * 0.6 * (1 - 0.35 * S.ey) : S.eq * 0.6 + c * 0.8 * S.ey), tp = S.eq - yap;
        o.esk.ayarla(yap, dt); eskYuk(o.esk, 0.3, tp, yap).forEach(y => L.push(y));
        if (S.cub) for (let i = 0; i < 5; i++) L.push({ p: V3(0.3 + 0.12, o.scubuk.position.y - 0.7 + i * 0.3, 0.06), s: S.cub });
        FZ.setTag('esA', `Elektroskop: ${S.eq ? isaret(S.eq) : 'nötr'}`); FZ.show('esA', V3(-1.2, 0.5, 0.4), 1);
        FZ.setTag('esB', S.cub === 0 ? 'Nötr iletken' : S.cub > 0 ? 'Cam çubuk: +5q' : 'Ebonit çubuk: −5q'); FZ.show('esB', V3(1.25, o.scubuk.position.y + 0.3, 0), 1);
        FZ.setTag('esT', `topuz ${isaret(tp)}<br>${Math.abs(yap) < 1 ? 'yapraklar kapalı' : 'yapraklar açık'}`); FZ.show('esT', V3(1.75, 2.45, 0.3), 1);
        FZ.setTag('esC', `yapraklar ${isaret(yap)}`); FZ.show('esC', V3(1.35, 0.6, 0.3), 1);
      } else {
        // Faraday kabı · sen A: kap +6 yüklü, deneme küresi iç/dış yüzeye değer · sen B: kap nötr, +4 yüklü top içeri iner
        if (S.fkos) { S.fz = Math.min(S.sen === 'A' ? 4 : 2, S.fz + dt * 0.55); if (S.fz >= (S.sen === 'A' ? 4 : 2)) S.fkos = 0; }
        const C = o.FK, R = o.R, f = S.fz, ust = V3(C.x, C.y + 1.9, 0), mrk = C.clone(); let p, qProb, ic = 0, dis;
        const ara = (a, b, u) => a.clone().lerp(b, FZ.ease(Math.max(0, Math.min(1, u))));
        if (S.sen === 'A') { const icD = V3(C.x + R * 0.8, C.y - 0.2, 0), disD = V3(C.x + R + 0.17, C.y - 0.35, 0.3);
          p = f < 1 ? ara(ust, mrk, f) : f < 1.5 ? ara(mrk, icD, (f - 1) * 2) : f < 2 ? ara(icD, mrk, (f - 1.5) * 2) : f < 3 ? ara(mrk, ust, f - 2) : ara(ust, disD, f - 3);
          qProb = f >= 3.95 ? 1 : 0; dis = 6 - qProb; }
        else { const dip = V3(C.x, C.y - R + 0.17, 0); p = f < 1 ? ara(ust, mrk, f) : ara(mrk, dip, f - 1);
          const degdi = f >= 1.98; qProb = degdi ? 0 : 4; ic = degdi ? 0 : (f > 0.55 ? -4 : 0); dis = degdi ? 4 : -ic; }
        o.prob.position.copy(p);
        cember(C, R * 1.06, Math.abs(dis), -Math.PI * 0.95, Math.PI * 0.32, 0.1).forEach(q => L.push({ q, p: q, s: Math.sign(dis) }));
        if (ic) cember(C, R * 0.82, Math.abs(ic), -Math.PI * 0.85, -Math.PI * 0.15, 0.1).forEach(q => L.push({ p: q, s: -1 }));
        for (let i = 0; i < qProb; i++) L.push({ p: p.clone().add(V3(Math.cos(i * 1.6) * 0.18, Math.sin(i * 1.6) * 0.18, 0.12)), s: 1 });
        o.fesk.ayarla(dis * 0.9, dt); eskYuk(o.fesk, 1.9, dis * 0.25, dis * 0.6).forEach(y => L.push(y));
        FZ.setTag('esA', `Deneme küresi: ${isaret(qProb)}`); FZ.show('esA', p.clone().add(V3(1.2, 0.9, 0)), 1);
        FZ.setTag('esB', `İç yüzey: ${isaret(ic)} · dış yüzey: ${isaret(dis)}`); FZ.show('esB', V3(C.x, -0.4, 0.8), 1);
        FZ.setTag('esT', S.sen === 'A' ? (f < 2 ? 'Yük DIŞ yüzeyde, iç yüzey yüksüz' : f < 3.9 ? 'İç yüzeye değdi: yük almadı' : 'Dış yüzeye değdi: yük aldı') : (f < 0.55 ? 'Kap nötr, küre (+) yüklü' : f < 1.98 ? 'İç yüzey (−), dış yüzey (+)' : 'Küre bütün yükünü verdi'));
        FZ.show('esT', V3(0.9, 3.75, 0), 1);
      }
      yukCiz(o.yuk, L, dt);
    },
    qp: () => V3(0.4, 3.8, 0) });

  const surtBasla = (S, ci) => { Object.assign(S, { mod: 'surt', ci, n: 0, surt: 0, yak: 0, kag: 0 }); };
  const etkiBasla = S => { Object.assign(S, { mod: 'etki', ea: 0, ak: 0, ey: 0 }); };
  const eskBasla = (S, eq, cub) => { Object.assign(S, { mod: 'elskop', eq, cub, yak: 0, ey: 0 }); };
  const farBasla = (S, sen) => { Object.assign(S, { mod: 'faraday', sen, fz: 0, fkos: 0 }); };

  const d3 = ders(sLab, { yk: 'TYT6-d3', no: 3, icon: '🪮', name: 'Sürtünme ile elektriklenme ve kâğıt kaldırma', task: 'Triboelektrik sıra, sürtünmede eşit ve zıt yük, kutuplanma: yüklü çubuk nötr kâğıdı neden çeker?', steps: [
    { do: S => surtBasla(S, 0), k: { tur: 'merak', b: 'Saçına sürttüğün tarak kâğıt parçalarını neden kaldırır?', m: ['Kâğıt yüksüz olduğu halde çubuğa sıçrar. Bazıları dokunduktan sonra geri fırlar. Neden?'], dugme: 'Başlayalım ▶︎' } },
    { p: { t: 'Ebonit çubuk yün kumaşa sürtülürse ne olur?', o: ['Yalnız çubuk yüklenir', 'Çubuk ve kumaş zıt işaretli, eşit miktarda yüklenir', 'İkisi de aynı işaretli yüklenir', 'Hiçbiri yüklenmez'], d: 1 } },
    { sub: 'Yün kumaşla ebonit çubuğu sürtelim.', go: '▶︎ Sürt' },
    { do: S => { S.n = 0; S.surt = 1; }, sub: 'Sürtünme…', until: S => S.n >= 6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Elektronlar kumaştan çubuğa geçti', f: ['esA', 'esB'], m: ['Ebonit (−), yün (+) yüklendi: <em>zıt işaretli ve eşit miktarda</em>. Toplam yük korunur.', 'Yalnız elektron hareket eder; proton yerinden çıkmaz.', 'Çubuk yalıtkan olduğu için yük, sürtülen yerde kalır.'] } },
    { k: { tur: 'kavram', b: 'Triboelektrik sıra', m: ['(+) uç → <em>insan saçı · cam · yün · ipek · kâğıt · pamuk · ebonit · plastik</em> ← (−) uç', 'İki madde sürtülünce sırada <em>önde olan (+)</em>, arkada olan (−) yüklenir.', 'Cam–ipek: cam (+) · ebonit–yün: ebonit (−) · plastik tarak–saç: tarak (−).'] } },
    { p: { t: 'Yüklü çubuk masadaki yüksüz kâğıt parçalarına yaklaştırılırsa ne olur?', o: ['Hiçbir şey olmaz', 'Kâğıtlar çubuğa çekilir', 'Kâğıtlar itilir', 'Kâğıtlar yüklenip uzaklaşır'], d: 1 } },
    { sub: 'Çubuğu kâğıtların üstüne getirelim.', go: '▶︎ Yaklaştır' },
    { do: S => { S.yak = 0.001; S.kag = 0; }, sub: 'Kâğıtlar sıçrıyor…', until: S => S.kag > 2.4 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kutuplanma', f: ['esT'], m: ['Nötr kâğıdın molekülleri <em>kutuplanır</em>: çubuğa yakın yüzü zıt, uzak yüzü aynı işaretli olur. Yakın yüz daha yakın olduğundan çekme kuvveti büyük çıkar: kâğıt çekilir.', 'Bazı kâğıtlar çubuğa dokununca onun yükünden alır, <em>aynı işaretle</em> yüklenir ve itilir.'] } },
    { k: { tur: 'dikkat', b: 'Sık yapılan yanlış', m: ['"Çekiliyorsa kesin zıt yüklüdür" yanlıştır: <em>nötr cisim de çekilir</em>.', '<em>İtme</em> varsa iki cisim kesinlikle aynı işaretlidir. Yük işaretini anlamanın güvenilir yolu itmedir.'] } },
    { x: { b: 'Madde çiftini değiştir', m: ['Çifti seç, sürt ve kâğıtlara yaklaştır.'],
      kay: [{ ad: 'ci', etiket: 'Çift', min: 0, max: 2, adim: 1, deger: 1, birim: '', set: (S, v) => { surtBasla(S, v); S.n = 6; } }],
      olc: S => { const [a, b, s] = CIFT[S._ci]; return `<em>${a} – ${b}</em>: ${a} ${s > 0 ? '(+)' : '(−)'}, ${b} ${s > 0 ? '(−)' : '(+)'}<br>Kâğıtlar her iki durumda da çekilir: nötr cisim her yüklü cisme çekilir.`; } } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Sürtünme: zıt işaretli, eşit miktarda yük · triboelektrik sırada önde olan (+) olur.', 'Nötr cisim kutuplanarak yüklü cisme çekilir; dokunup yük alınca itilir.'] } },
  ] });

  const d4 = ders(sLab, { yk: 'TYT6-d4', no: 4, icon: '🌍', name: 'Etki ile elektriklenme ve topraklama', task: 'Yaklaştır → toprakla → topraklamayı kes → uzaklaştır: iletken küre çubuğa zıt işaretle yüklenir.', steps: [
    { do: etkiBasla, k: { tur: 'merak', b: 'Dokunmadan yüklemek mümkün mü?', m: ['Yüklü çubuğu küreye hiç değdirmeden küreyi kalıcı olarak yükleyebilir miyiz?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Nötr iletken', m: ['Kürede (+) ve (−) yük eşit sayıdadır. İletkende elektronlar serbestçe dolaşabilir.', 'Kırmızı noktalar sabit (+) yükü, mavi noktalar hareketli elektronları gösterir.'] } },
    { sub: '1. adım: (−) yüklü ebonit çubuğu yaklaştıralım.', go: '▶︎ Yaklaştır' },
    { do: S => { S.ea = 1; }, sub: 'Elektronlar itiliyor…', wait: 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yükler ayrıştı', f: ['esT'], m: ['Elektronlar çubuktan uzak uca itildi: yakın uç (+), uzak uç (−). Toplam yük hâlâ <em>sıfır</em>.'] } },
    { p: { t: 'Çubuk yakındayken küre toprağa bağlanırsa ne olur?', o: ['Topraktan küreye elektron gelir', 'Küreden toprağa elektron gider', 'Proton toprağa gider', 'Hiçbir şey olmaz'], d: 1 } },
    { sub: '2. adım: küreyi toprağa bağlayalım.', go: '▶︎ Toprakla' },
    { do: S => { S.ea = 2; S.ak = 0; }, sub: 'Elektronlar toprağa akıyor…', until: S => S.ak >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'İtilen elektronlar toprağa kaçtı', m: ['(−) çubuk elektronları iter; toprak, elektronların gidebileceği çok büyük bir iletkendir.', 'Çubuk (+) olsaydı topraktan küreye elektron gelirdi.'] } },
    { sub: '3. adım: toprak bağlantısını keselim (çubuk hâlâ yakında).', go: '▶︎ Kes' },
    { do: S => { S.ea = 3; }, sub: 'Bağlantı kesildi.', wait: 1.2 },
    { sub: '4. adım: çubuğu uzaklaştıralım.', go: '▶︎ Uzaklaştır' },
    { do: S => { S.ea = 4; }, sub: 'Kalan yük yüzeye dağılıyor…', wait: 2.2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Küre çubuğa zıt işaretle yüklendi', f: ['esA'], m: ['Küre <em>+3q</em> ile yüklü kaldı; yük iletkenin dış yüzeyine düzgün dağıldı.', 'Etki ile elektriklenmede iletken, yaklaştırılan cisme <em>zıt</em> işaretle yüklenir.'] } },
    { k: { tur: 'dikkat', b: 'Sıra önemli', m: ['Önce çubuğu uzaklaştırıp sonra topraklamayı kesersen: elektronlar topraktan geri gelir, küre <em>nötr</em> kalır.', 'Topraklama yokken çubuk uzaklaşırsa yükler yeniden karışır: küre yine nötr.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Yaklaştır → toprakla → kes → uzaklaştır ⇒ iletken <em>zıt</em> işaretle yüklenir.', 'Dokunma ile elektriklenmede ise <em>aynı</em> işaretle yüklenir.'] } },
  ] });

  const d5 = ders(sLab, { yk: 'TYT6-d5', no: 5, icon: '🍃', name: 'Elektroskop ne söyler?', task: 'Nötr ve yüklü elektroskoba (+), (−) ve nötr iletken cisim yaklaştırma deneyleri.', steps: [
    { do: S => eskBasla(S, 0, 1), k: { tur: 'merak', b: 'Yüklü mü, değil mi?', m: ['Elektroskop, yükü gözle görmemizi sağlayan basit bir alettir: iki ince metal yaprak aynı işaretle yüklenince birbirini iter ve açılır.'], dugme: 'Başlayalım ▶︎' } },
    { p: { t: 'Nötr elektroskobun topuzuna (+) yüklü cam çubuk yaklaştırılıyor (dokunmadan). Yapraklar ne yapar?', o: ['Kapalı kalır', 'Açılır', 'Önce açılır sonra kapanır', 'Topuz eriyip kopar'], d: 1 } },
    { sub: 'Cam çubuğu yaklaştıralım.', go: '▶︎ Yaklaştır' },
    { do: S => { S.yak = 1; }, sub: 'Elektronlar topuza çekiliyor…', wait: 2.6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Etki ile açıldı', f: ['esA', 'esT'], m: ['Elektronlar topuza çekildi; yapraklarda (+) yük kaldı, yapraklar <em>açıldı</em>.', 'Elektroskobun toplam yükü hâlâ sıfır. Çubuk uzaklaşınca yapraklar kapanır.'] } },
    { do: S => eskBasla(S, 4, 1), sub: '(+) yüklü elektroskoba (+) çubuk yaklaştıralım.', go: '▶︎ Yaklaştır' },
    { do: S => { S.yak = 1; }, sub: 'Yapraklara daha çok (+) yük itiliyor…', wait: 2.6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Aynı işaret: daha çok açılır', f: ['esT'], m: ['Elektroskop ile aynı işaretli cisim yaklaşınca yapraklar <em>daha çok açılır</em>.'] } },
    { do: S => eskBasla(S, 4, -1), p: { t: '(+) yüklü elektroskoba (−) yüklü çubuk yavaş yavaş yaklaştırılıyor. Yapraklar ne yapar?', o: ['Daha çok açılır', 'Önce kapanır; çubuk çok yaklaşırsa yeniden açılabilir', 'Hiç değişmez', 'Hemen tamamen kapanır ve hep kapalı kalır'], d: 1 } },
    { sub: 'Ebonit çubuğu yaklaştıralım.', go: '▶︎ Yaklaştır' },
    { do: S => { S.yak = 1; }, sub: 'Elektronlar yapraklara itiliyor…', wait: 3.4 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Zıt işaret: önce kapanır', f: ['esT'], m: ['İtilen elektronlar yapraklardaki (+) yükü nötrledi: yapraklar <em>kapandı</em>. Çubuğun yükü yeterince büyükse yapraklar bu kez (−) yükle yeniden açılır.'] } },
    { do: S => eskBasla(S, 4, 0), sub: '(+) yüklü elektroskoba nötr bir iletken yaklaştıralım.', go: '▶︎ Yaklaştır' },
    { do: S => { S.yak = 1; }, sub: 'Nötr iletken kutuplanıyor…', wait: 2.6 },
    { k: { tur: 'dikkat', b: 'Nötr iletken de kapatır', f: ['esT'], m: ['Nötr iletken yaklaşınca yapraklar <em>biraz kapanır</em>.', 'Sonuç: yapraklar kapanıyorsa cisim zıt yüklü <em>ya da</em> nötr iletken olabilir. Açılıyorsa cisim kesinlikle <em>aynı</em> işaretlidir.'] } },
    { x: { b: 'Kendin dene', m: ['Elektroskobun yükünü ve çubuğu seç.'],
      kay: [{ ad: 'eq', etiket: 'Elektroskop', min: -4, max: 4, adim: 4, deger: 4, birim: 'q', set: (S, v) => { eskBasla(S, v, S._cub == null ? 1 : S._cub); S.yak = 1; } },
            { ad: 'cub', etiket: 'Çubuk (−1, 0, +1)', min: -1, max: 1, adim: 1, deger: 1, birim: '', set: (S, v) => { eskBasla(S, S._eq == null ? 4 : S._eq, v); S.yak = 1; } }],
      olc: S => { const e = S._eq, c = S._cub; const sonuc = c === 0 ? (e ? 'biraz kapanır' : 'değişmez') : !e ? 'açılır' : Math.sign(e) === c ? 'daha çok açılır' : 'önce kapanır (çok yaklaşırsa yeniden açılır)';
        return `Elektroskop ${e ? isaret(e) : 'nötr'} · çubuk ${c === 0 ? 'nötr iletken' : c > 0 ? '(+)' : '(−)'}<br>Yapraklar <em>${sonuc}</em>`; } } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Açılıyorsa: aynı işaret (kesin) · kapanıyorsa: zıt işaret ya da nötr iletken.', 'Nötr elektroskop yüklü her cisimle (dokunmadan) açılır; yapraklar çubukla aynı işaretli olur.'] } },
  ] });

  const d6 = ders(sLab, { yk: 'TYT6-d6', no: 6, icon: '🔮', name: 'İçi boş iletken: Faraday kabı ve kafesi', task: 'Yük iletkenin dış yüzeyindedir · içeri indirilen yüklü kürenin etkisi · tabana değince bütün yükünü verir · Faraday kafesi.', steps: [
    { do: S => farBasla(S, 'A'), k: { tur: 'merak', b: 'Yıldırım düşen arabadaki yolcuya neden bir şey olmaz?', m: ['Cevap, içi boş iletkenlerin ilginç bir özelliğinde saklı. Üstü delikli metal bir kürenin (Faraday kabı) içine ve dışına küçük bir deneme küresi değdireceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Düzenek', f: ['esB'], m: ['Kap (+) yüklü ve bir elektroskoba bağlı. Deneme küresi yalıtkan bir sapın ucunda, başta yüksüz.'] } },
    { p: { t: 'Deneme küresi kabın İÇ yüzeyine değdirilip çıkarılırsa yük alır mı?', o: ['Evet, çok yük alır', 'Hayır, iç yüzeyde yük yoktur', 'Evet, zıt işaretli yük alır', 'Kap nötrleşir'], d: 1 } },
    { sub: 'Önce iç yüzeye, sonra dış yüzeye değdirelim.', go: '▶︎ Başlat' },
    { do: S => { S.fz = 0; S.fkos = 1; }, sub: 'Deneme küresi iniyor…', until: S => S.fz >= 4 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yük dış yüzeyde toplanır', f: ['esA', 'esB'], m: ['İç yüzeye değen küre <em>yük almadı</em>; dış yüzeye değince yük aldı.', 'İletkendeki yükler birbirini iterek birbirinden en uzağa, yani <em>dış yüzeye</em> yerleşir. İletkenin içinde elektrik alan sıfırdır.'] } },
    { do: S => farBasla(S, 'B'), k: { tur: 'kavram', b: '2. deney', f: ['esB'], m: ['Şimdi kap nötr. Deneme küresi +4q ile yüklü ve kabın içine indirilecek.'] } },
    { p: { t: 'Yüklü küre kaba değmeden içeri indirilince elektroskobun yaprakları ne yapar?', o: ['Kapalı kalır', 'Açılır', 'Önce açılır sonra kapanır', 'Kap kırılır'], d: 1 } },
    { sub: 'Küreyi içeri indirelim; sonra tabana değdirelim.', go: '▶︎ İndir' },
    { do: S => { S.fz = 0; S.fkos = 1; }, sub: 'Küre içeri iniyor…', until: S => S.fz > 1.3 },
    { k: { tur: 'gozlem', sonuc: true, b: 'İç yüzey zıt, dış yüzey aynı işaretli', f: ['esB'], m: ['Küre +4q → iç yüzeyde <em>−4q</em>, dış yüzeyde <em>+4q</em> toplandı (etki). Kabın toplam yükü yine sıfır.', 'Dış yüzeye bağlı elektroskop <em>açıldı</em>.'] } },
    { p: { t: 'Küre kabın tabanına değerse elektroskobun yaprakları ne olur?', o: ['Değişmez', 'Kapanır', 'Daha çok açılır', 'Önce kapanır sonra açılır'], d: 0 } },
    { sub: 'Küre tabana değiyor.', until: S => S.fz >= 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Küre bütün yükünü verdi', f: ['esA', 'esB'], m: ['Küre +4q, iç yüzeydeki −4q ile nötrleşti: küre <em>0</em>, iç yüzey 0, dış yüzey <em>+4q</em>.', 'Dış yüzey zaten +4q olduğundan elektroskop <em>değişmedi</em>. İçten değen cisim yükünün tamamını verir (dışarıdan değmede yarıçapla paylaşılırdı).'] } },
    { k: { tur: 'gunluk', b: 'Faraday kafesi', m: ['Metal kafesin içinde elektrik alan sıfırdır: dışarıdaki yükler içeriyi etkilemez.', 'Yıldırım düşen <em>arabada</em> ve <em>uçakta</em> yük metal gövdenin dış yüzeyinden akıp gider. Asansörde ve mikrodalga fırının metal kutusunda telefon çekmez; hassas kablolar metal örgüyle sarılır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['İletkende yük <em>dış yüzeydedir</em>, içeride alan sıfırdır.', 'İçeri indirilen yük: iç yüzey zıt, dış yüzey aynı işaretli · tabana değince bütün yükünü verir.'] } },
  ] });

  const g3 = gorev(sLab, { yk: 'TYT6-g3', no: 3, icon: '⚡', name: 'Elektrostatik laboratuvarı · sorular', task: 'Sürtünme, kutuplanma, etki ile yükleme, elektroskop ve Faraday kabı soruları.', steps: [
    { do: S => surtBasla(S, 1), sub: 'Cam çubuk ve ipek kumaş.', go: '▶︎ Başlat' },
    { do: S => { S.surt = 1; }, q: { t: 'Triboelektrik sırada cam, ipekten önce gelir. Cam çubuk ipeğe sürtülünce çubuk ve kumaşın yükleri ne olur?', o: ['Cam (+), ipek (−), eşit miktarda', 'Cam (−), ipek (+), eşit miktarda', 'Cam (+), ipek nötr', 'İkisi de (+)'], f: ['esA', 'esB'],
      s: ['Sırada önde olan elektron verir: <em>cam (+)</em>, ipek (−).', 'Toplam yük korunur: miktarlar <em>eşit</em> ✓'], n: ['Sürtünen iki cisim her zaman zıt işaretli ve eşit büyüklükte yüklenir.', 'Geçen parçacık elektrondur; cam proton kazanmaz, elektron kaybeder.'] } },
    { do: S => { S.n = 6; S.surt = 0; S.yak = 0.001; S.kag = 0; }, q: { t: 'Yüklü bir çubuk nötr kâğıt parçalarına yaklaştırılıyor. Kâğıtların bir kısmı çubuğa yapışıp kısa süre sonra itiliyor. İtilmenin sebebi nedir?', o: ['Dokunan kâğıt çubukla aynı işaretli yük almıştır', 'Kâğıt kendiliğinden zıt yüklenmiştir', 'Çubuğun yükü bitmiştir', 'Yer çekimi artmıştır'], f: ['esT'],
      s: ['Nötr kâğıt kutuplanıp çekildi.', 'Dokununca çubuğun yükünden aldı, <em>aynı işaretle</em> yüklendi ve itildi ✓'], n: ['Nötr cisim yüklü cisme her zaman çekilir; itme yalnız aynı işaretli yükler arasında olur.'] } },
    { do: etkiBasla, q: { t: 'Nötr iletken küreye (−) yüklü çubuk yaklaştırılıyor. Sırasıyla küre toprağa bağlanıyor, bağlantı kesiliyor ve çubuk uzaklaştırılıyor. Kürenin son yükü ne olur?', o: ['(+)', '(−)', 'Nötr', 'Önce (+) sonra nötr'], f: ['esA'],
      s: ['(−) çubuk elektronları iter; toprak bağlıyken elektronlar toprağa gider.', 'Bağlantı kesilip çubuk uzaklaşınca küre <em>(+)</em> kalır ✓'], n: ['Etki ile elektriklenmede iletken, yaklaştırılan cisme zıt işaretle yüklenir.', 'Çubuk topraklama kesilmeden uzaklaştırılsaydı küre nötr kalırdı.'] } },
    { do: S => eskBasla(S, -4, -1), q: { t: '(−) yüklü elektroskobun topuzuna bir K cismi dokunmadan yaklaştırılıyor ve yapraklar daha çok açılıyor. K için ne söylenebilir?', o: ['Kesinlikle (−) yüklüdür', 'Kesinlikle (+) yüklüdür', 'Nötr iletkendir', '(+) ya da nötr olabilir'], f: ['esT'],
      s: ['Yaprakların <em>daha çok açılması</em> yalnız aynı işaretli cisimle olur.', 'K kesinlikle <em>(−)</em> ✓'], n: ['Kapanma görülseydi K (+) ya da nötr iletken olabilirdi; kesin karar verilemezdi.'] } },
    { do: S => farBasla(S, 'B'), q: { t: 'Üstü delikli, nötr, içi boş metal kap bir elektroskoba bağlı. +4q yüklü metal küre kaba değmeden içeri indirilip sonra tabana değdiriliyor. Son durumda kürenin yükü ve kabın dış yüzeyinin yükü nedir?', o: ['Küre 0, dış yüzey +4q', 'Küre +2q, dış yüzey +2q', 'Küre +4q, dış yüzey 0', 'Küre 0, dış yüzey 0'], f: ['esA', 'esB'],
      s: ['İçeri inince: iç yüzey −4q, dış yüzey +4q.', 'Tabana değince küre ile iç yüzey nötrleşir: <em>küre 0, dış yüzey +4q</em> ✓'], n: ['İçten değen iletken bütün yükünü kaba verir; dışarıdan değseydi yük yarıçapla paylaşılırdı.', 'Elektroskop küre tabana değerken değişmez: dış yüzeyin yükü zaten +4q idi.'] } },
    { do: S => farBasla(S, 'A'), q: { t: 'Yıldırım düşen bir arabanın içindeki yolcunun zarar görmemesinin sebebi aşağıdakilerden hangisidir?', o: ['Yük metal gövdenin dış yüzeyinde kalır; iç bölgede elektrik alan sıfırdır', 'Lastikler yükü tamamen durdurur', 'Arabanın içinde hava yoktur', 'Yıldırım metali delemez'], f: ['esT'],
      s: ['Metal gövde <em>Faraday kafesi</em> gibi davranır: yük dış yüzeyden akar, içeride alan sıfırdır ✓'], n: ['Lastikler yalıtkan olsa da milyonlarca voltluk yıldırımı durduramaz; koruyan metal gövdedir.'] } },
  ] });
  FZ.konuEk('TYT', 'Elektrostatik', { dersler: [d3, d4, d5, d6], gorevler: [g3] });

  // =====================================================================
  // AYT · ELEKTRİK ALAN ÇİZGİLERİ (tek +, tek −, dipol, iki +, paralel levhalar) + test yükü
  // =====================================================================
  const Y0 = 2;
  const DUZ = {
    arti: [{ x: 0, y: Y0, q: 1 }], eksi: [{ x: 0, y: Y0, q: -1 }],
    dipol: [{ x: -1.3, y: Y0, q: 1 }, { x: 1.3, y: Y0, q: -1 }], ikiArti: [{ x: -1.3, y: Y0, q: 1 }, { x: 1.3, y: Y0, q: 1 }], levha: [] };
  const AD = { arti: 'Tek (+) yük', eksi: 'Tek (−) yük', dipol: 'Dipol (+q, −q)', ikiArti: 'İki (+) yük', levha: 'Paralel levhalar' };
  const alan = (Q, p) => { if (!Q.length) return V3(-1, 0, 0); const E = V3(); Q.forEach(c => { const d = V3(p.x - c.x, p.y - c.y, 0), r = Math.max(0.12, d.length()); E.add(d.multiplyScalar(c.q / (r * r * r))); }); return E; };
  const cizgiler = (Q) => { const L = []; if (!Q.length) { for (let i = 0; i < 7; i++) { const y = 0.7 + i * 0.45; L.push([V3(1.6, y, 0), V3(-1.6, y, 0)]); } return L; }
    const kaynak = Q.some(c => c.q > 0) ? Q.filter(c => c.q > 0) : Q, yon = Q.some(c => c.q > 0) ? 1 : -1;
    kaynak.forEach(c => { for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + 0.13; let p = V3(c.x + 0.28 * Math.cos(a), c.y + 0.28 * Math.sin(a), 0); const pts = [p.clone()];
      for (let s = 0; s < 400; s++) { const E = alan(Q, p); if (E.length() < 1e-6) break; p = p.clone().add(E.normalize().multiplyScalar(0.05 * yon)); pts.push(p);
        if (Math.abs(p.x) > 4.2 || p.y < 0.1 || p.y > 4.2 || Q.some(o => o !== c && Math.hypot(p.x - o.x, p.y - o.y) < 0.25)) break; }
      if (pts.length > 3) L.push(yon > 0 ? pts : pts.reverse()); } });
    return L; };
  const sAlan = sahne({ icon: '🧲', cam: [[0.9, 2.1, 10.5], [0.9, 2.1, 0]], plate: [10, 4, 0, -1.5],
    data: [['Alan çizgisi', '(+) → (−)']],
    S0: () => ({ duz: 'arti', tk: 0, tp: null }),
    kur(g) {
      const G = {};
      Object.entries(DUZ).forEach(([k, Q]) => { const gr = new THREE.Group(); g.add(gr); G[k] = gr;
        cizgiler(Q).forEach(pts => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xfbbf24 })); gr.add(l);
          const i = Math.floor(pts.length * 0.45), a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)], kon = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 10), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
          kon.position.copy(a); kon.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize()); gr.add(kon); });
        Q.forEach(c => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16), new THREE.MeshLambertMaterial({ color: c.q > 0 ? ARTI : EKSI })); m.position.set(c.x, c.y, 0); gr.add(m); });
        if (k === 'levha') { kutu(gr, 0.12, 3.4, 1.2, ARTI, 1.75, 2.1, 0); kutu(gr, 0.12, 3.4, 1.2, EKSI, -1.75, 2.1, 0); } });
      const test = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: 0x22c55e })); g.add(test); test.visible = false;
      kart('eaT', '', '#F5C400'); etiket('eaQ', '', '#dc2626'); etiket('eaQ2', '', '#2563eb'); etiket('eaP', 'test yükü (+)', '#16a34a');
      return { G, test };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = k === S.duz);
      const Q = DUZ[S.duz];
      if (S.tk) { if (!S.tp) S.tp = S.duz === 'levha' ? V3(1.5, 2.6, 0.1) : S.duz === 'eksi' ? V3(-3, 3.2, 0.1) : S.duz === 'ikiArti' ? V3(-1.3, 2.45, 0.1) : V3(Q[0].x + 0.3, Q[0].y + 0.25, 0.1);
        const E = alan(Q, S.tp); if (E.length() > 1e-6 && Math.abs(S.tp.x) < 4.2 && S.tp.y > 0.2 && S.tp.y < 4.2 && !Q.some(c => c.q < 0 && Math.hypot(S.tp.x - c.x, S.tp.y - c.y) < 0.3) && !(S.duz === 'levha' && S.tp.x < -1.6))
          S.tp.add(E.normalize().multiplyScalar(dt * 1.2)); }
      o.test.visible = !!S.tk; if (S.tk) { o.test.position.copy(S.tp); FZ.show('eaP', S.tp.clone().add(V3(0, 0.35, 0)), 1); }
      const qa = Q.find(c => c.q > 0), qe = Q.find(c => c.q < 0);
      if (qa) { FZ.setTag('eaQ', '+q'); FZ.show('eaQ', V3(qa.x, qa.y - 0.55, 0.3), 1); } else if (S.duz === 'levha') { FZ.setTag('eaQ', '+'); FZ.show('eaQ', V3(1.75, 4, 0.3), 1); }
      if (qe) { FZ.setTag('eaQ2', '−q'); FZ.show('eaQ2', V3(qe.x, qe.y - 0.55, 0.3), 1); } else if (S.duz === 'levha') { FZ.setTag('eaQ2', '−'); FZ.show('eaQ2', V3(-1.75, 4, 0.3), 1); }
      FZ.setTag('eaT', AD[S.duz]); FZ.show('eaT', V3(0, 4.5, 0), 1);
    },
    qp: () => V3(0, 4.6, 0) });
  const duzen = (S, d) => { S.duz = d; S.tk = 0; S.tp = null; };
  const ALAN_LIST = ['arti', 'eksi', 'dipol', 'ikiArti', 'levha'];
  const d11 = ders(sAlan, { yk: 'AYT11-d2', no: 2, icon: '🧲', name: 'Elektrik alan çizgileri laboratuvarı', task: 'Tek yük, dipol, iki aynı yük ve paralel levhaların alan çizgileri; test yükünün hareketi; Coulomb dengesi.', steps: [
    { do: S => duzen(S, 'arti'), k: { tur: 'merak', b: 'Görünmeyen alanı nasıl çizeriz?', m: ['Bir yükün çevresine küçük (+) bir test yükü koyarsak hangi yöne itilir? Bu yönleri birleştiren çizgilere <em>elektrik alan çizgileri</em> denir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Elektrik alan', f: ['eaT'], m: [`${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)} · ${FM(`F = q · E`)}`, 'Alan çizgileri <em>(+) yükten dışarı çıkar</em>, (−) yüke girer. Çizgilerin sık olduğu yerde alan büyüktür.'] } },
    { p: { t: 'Tek (+) yükün yanına bırakılan (+) test yükü nasıl hareket eder?', o: ['Yüke doğru gelir', 'Alan çizgisi boyunca yükten uzaklaşır', 'Yükün çevresinde döner', 'Yerinde kalır'], d: 1 } },
    { sub: 'Test yükünü bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.tk = 1; }, sub: 'Test yükü hareket ediyor…', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Test yükü alan yönünde gider', f: ['eaP'], m: ['(+) test yükü alan çizgisi boyunca hızlanarak uzaklaştı. (−) bir yük bıraksaydık alanın <em>tersi</em> yönde hareket ederdi.'] } },
    { do: S => duzen(S, 'eksi'), k: { tur: 'gozlem', b: 'Tek (−) yük', f: ['eaT'], m: ['Çizgiler sonsuzdan gelip (−) yüke <em>girer</em>.'] } },
    { do: S => duzen(S, 'dipol'), k: { tur: 'gozlem', b: 'Dipol', f: ['eaQ', 'eaQ2'], m: ['Çizgiler (+) yükten çıkıp (−) yüke girer. İki yükün tam ortasında alan sıfır değildir: (+)\'dan (−)\'ye doğrudur.'] } },
    { do: S => duzen(S, 'ikiArti'), p: { t: 'Eşit iki (+) yükün tam ortasında elektrik alan nasıldır?', o: ['En büyüktür', 'Sıfırdır', '(+) yüklerden birine doğrudur', 'Yukarı doğrudur'], d: 1 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'İki aynı işaretli yük', f: ['eaT'], m: ['Çizgiler birbirini iter gibi kıvrılır; tam ortada iki alan eşit ve zıt: <em>E = 0</em>.', 'Alan çizgileri <em>asla kesişmez</em>: bir noktada alanın tek yönü vardır.'] } },
    { do: S => duzen(S, 'levha'), k: { tur: 'kavram', b: 'Paralel levhalar: düzgün alan', f: ['eaT'], m: ['Levhalar arasında çizgiler paralel ve eşit aralıklı: alan her yerde aynı (<em>düzgün</em>).', `${FM(`E = ${F('V', 'd')}`)} · test yükü sabit kuvvetle (sabit ivmeyle) (+) levhadan (−) levhaya gider.`] } },
    { sub: 'Levhalar arasına test yükü bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.tk = 1; }, sub: 'Düzgün alanda hareket…', wait: 3 },
    { x: { b: 'Düzeni seç', m: ['Beş düzende test yükünün yolunu izleyin.'],
      kay: [{ ad: 'd', etiket: 'Düzen', min: 0, max: 4, adim: 1, deger: 2, birim: '', set: (S, v) => { duzen(S, ALAN_LIST[v]); S.tk = 1; } }],
      olc: S => `<em>${AD[ALAN_LIST[S._d]]}</em><br>(+) test yükü alan çizgisine teğet kuvvet alır ve (+) yükten uzaklaşır, (−) yüke yaklaşır.` } },
    { k: { tur: 'ornek', b: 'Coulomb: q₃ nerede dengede kalır?', m: ['+4q yükü x = 0\'da, +q yükü x = 3 m\'de. Üçüncü bir yük aralarında nerede dengede kalır?', `k${F('4q · q<sub>3</sub>', 'x<sup>2</sup>')} = k${F('q · q<sub>3</sub>', '(3 − x)<sup>2</sup>')} → ${F('2', 'x')} = ${F('1', '3 − x')} → <em>x = 2 m</em>`, 'Denge noktası <em>küçük yüke yakındır</em> ve q₃\'ün işaretinden bağımsızdır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Çizgiler (+)\'dan çıkar (−)\'ye girer, kesişmez; sıklık = alan büyüklüğü.', `${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)} · ${FM('F = qE')} · levhalar arasında alan düzgündür.`] } },
  ] });
  const g11 = gorev(sAlan, { yk: 'AYT11-g2', no: 2, icon: '🧲', name: 'Alan çizgileri ve Coulomb dengesi', task: 'Alan çizgisi yorumlama, test yükü hareketi, alanın sıfır olduğu nokta ve q₃ dengesi.', steps: [
    { do: S => duzen(S, 'dipol'), sub: 'Dipolün alan çizgileri.', go: '▶︎ Başlat' },
    { q: { t: 'Şekildeki alan çizgileri için aşağıdakilerden hangisi doğrudur?', o: ['Sol yük (+), sağ yük (−)', 'İki yük de (+)', 'Sol yük (−), sağ yük (+)', 'İki yük de (−)'], f: ['eaQ', 'eaQ2'],
      s: ['Çizgiler soldaki yükten çıkıp sağdakine giriyor.', 'Çıktığı yük (+), girdiği yük (−): <em>sol (+), sağ (−)</em> ✓'], n: ['Ok yönü, (+) test yükünün itileceği yöndür.'] } },
    { do: S => duzen(S, 'ikiArti'), q: { t: '+q ve +q yükleri arasındaki uzaklık 2d. Tam orta noktadaki elektrik alanın büyüklüğü kaçtır?', o: ['0', `k${F('q', 'd<sup>2</sup>')}`, `2k${F('q', 'd<sup>2</sup>')}`, `k${F('q', '2d<sup>2</sup>')}`], f: ['eaT'],
      s: [`Her yükün ortadaki alanı k${F('q', 'd<sup>2</sup>')}, yönleri zıt.`, 'Bileşke <em>0</em> ✓'], n: ['Dipolde (+q, −q) ise ortada alanlar aynı yönde toplanır: 2kq/d².'] } },
    { do: S => duzen(S, 'levha'), q: { t: 'Paralel levhalar arasında durgun bırakılan bir elektron nasıl hareket eder? (Yer çekimi önemsiz)', o: ['(+) levhaya doğru düzgün hızlanır', '(−) levhaya doğru düzgün hızlanır', 'Sabit hızla (+) levhaya gider', 'Yerinde kalır'], f: ['eaQ', 'eaQ2'],
      s: ['Alan düzgün → kuvvet sabit → ivme sabit.', 'Elektron (−) olduğundan alanın tersine, <em>(+) levhaya doğru düzgün hızlanır</em> ✓'], n: ['(+) test yükü ise (−) levhaya doğru hızlanırdı.', 'Kuvvet sabit olduğu için hız düzgün artar; "sabit hız" olamaz.'] } },
    { do: S => duzen(S, 'arti'), q: { t: 'Noktasal yükten d uzaklıkta alan E\'dir. 3d uzaklıkta alan kaç E olur?', o: [F('E', '9'), F('E', '3'), '3E', '9E'], f: ['eaT'],
      s: [`E ∝ ${F('1', 'd<sup>2</sup>')} → ${F('1', '3<sup>2</sup>')} = <em>${F('E', '9')}</em> ✓`], n: ['Çizgiler yükten uzaklaştıkça seyrekleşir: alan küçülür.'] } },
    { q: { t: 'x = 0\'da +9q, x = 4 m\'de +q yükü var. İkisinin arasına konan q₃ yükü hangi noktada dengede kalır?', o: ['x = 3 m', 'x = 2 m', 'x = 1 m', 'x = 3,6 m'],
      s: [`§1. YOL`, `${F('9', 'x<sup>2</sup>')} = ${F('1', '(4 − x)<sup>2</sup>')} → ${F('3', 'x')} = ${F('1', '4 − x')} → 12 − 3x = x → <em>x = 3 m</em> ✓`, '§2. YOL', `Uzaklık oranı ${SQ('9')} : ${SQ('1')} = 3 : 1 → 4 m\'yi 3 : 1 böl: büyük yükten <em>3 m</em> ✓`], n: ['Aynı işaretli iki yükün denge noktası aralarında ve küçük yüke yakındır.', 'Zıt işaretli yüklerde denge noktası dışarıda, küçük yükün tarafındadır.'] } },
  ] });
  FZ.konuEk('AYT', 'Elektriksel Kuvvet ve Alan', { dersler: [d11], gorevler: [g11] });
})();
