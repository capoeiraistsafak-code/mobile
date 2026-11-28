// Konu modülleri için ortak araçlar. Her konu: bir 3D sahne + konu anlatımı (dersler) + soru çözümü (görevler).
// Konu anlatımı "Tahmin et → Gözle → Açıkla" düzenindedir: önce tahmin sorusu, sonra sahnede olay, sonra kural.
(function () {
  const { THREE, V3, mesh, setPlate, camGoal, scene, loopSnd } = FZ;
  FZ.sahne = function (o) {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const nes = o.kur ? o.kur(g) || {} : {};
    return {
      group: g, icon: o.icon || '🔬', data: o.data || [], notlar: o.notlar, nes,
      reset() {
        this.S = Object.assign({ t: 0 }, o.S0 ? o.S0() : {});
        const pl = o.plate || [12, 8, 0, 0]; setPlate(...pl);
        const c = o.cam || [[0, 6, 14], [0, 1.5, 0]]; camGoal(c[0], c[1], true);
        this.sesTur = o.ses || null; this.snd = o.ses ? loopSnd(o.ses) : { set() {}, stop() {} };
        if (o.basla) o.basla(this.S, nes);
      },
      tick(dt) { const S = this.S; S.t += dt; S.ses = null; if (o.tick) o.tick(S, dt, nes); const z = S.ses || [0, 0]; this.snd.set(z[0], z[1]); this.camFor(); },
      qp(at) { return o.qp ? o.qp(at, this.S, nes) : V3(0, 3, 0); },
      camFor() { if (o.cam2) { const c = o.cam2(this.S); if (c) camGoal(c[0], c[1], false); } },
    };
  };
  const yap = (taban, a, ders) => Object.assign(Object.create(taban), a, { ders, kisa: a.kisa || a.task, data: a.data || taban.data, notlar: a.notlar || taban.notlar });
  FZ.gorev = (taban, a) => yap(taban, a, false);
  FZ.ders = (taban, a) => yap(taban, a, true);
  // kısa yazım yardımcıları
  FZ.ok = (renk, tid) => { const a = FZ.arrow(renk); a.tid = tid; return a; };
  FZ.etiket = (id, html, bg, fg) => FZ.tag(id, html, bg, fg || '#fff');
  FZ.kart = (id, html, renk) => FZ.tag(id, html, renk || '#F5C400', '#fff', true);
  FZ.kutu = (g, w, h, d, renk, x, y, z, ops) => { const m = mesh(new THREE.BoxGeometry(w, h, d), renk, ops); m.position.set(x, y, z); g.add(m); return m; };
  FZ.top = (g, r, renk, x, y, z, ops) => { const m = mesh(new THREE.SphereGeometry(r, 28, 18), renk, ops); m.position.set(x, y, z); g.add(m); return m; };
  FZ.silindir = (g, r1, r2, h, renk, x, y, z, ops) => { const m = mesh(new THREE.CylinderGeometry(r1, r2, h, 32), renk, ops); m.position.set(x, y, z); g.add(m); return m; };
  FZ.cizgi = (g, renk, pts) => { const l = FZ.dashLine(renk); g.add(l); if (pts) FZ.setLine(l, pts); return l; };
  FZ.levha = (g, txt, w, h, bg, fg, x, y, z) => { const m = FZ.textSprite(txt, w, h, bg, fg); m.position.set(x, y, z); g.add(m); return m; };

  // Var olan bir konuya ek ders/görev ekler (konu anlatımı ve soru çözümü listelerinin sonuna)
  FZ.konuEk = (sinav, ad, ek) => { const h = FZ.HAZIR[sinav + '|' + ad]; if (!h) return FZ.konuEkle(sinav, ad, ek);
    (ek.dersler || []).forEach(m => { (h.dersler = h.dersler || []).push(m); FZ.GRUPLAR.add(m.group); });
    (ek.gorevler || []).forEach(m => { (h.gorevler = h.gorevler || []).push(m); FZ.GRUPLAR.add(m.group); }); };
  // Bir konunun var olan 3D sahnesini (taban) al: yeni ders/görevler aynı sahneyi kullanabilsin
  FZ.taban = (sinav, ad) => { const h = FZ.HAZIR[sinav + '|' + ad]; const m = h && ((h.gorevler && h.gorevler[0]) || (h.dersler && h.dersler[0])); return m ? Object.getPrototypeOf(m) : null; };

  // ---------- Gerçekçi hazır modeller ----------
  const parla = (m, renk, guc) => { m.material.emissive = new THREE.Color(renk); m.material.emissiveIntensity = guc; return m; };
  const teker = (g, r, w, x, y, z) => { const t = new THREE.Group(); t.position.set(x, y, z); g.add(t);
    const las = FZ.silindir(t, r, r, w, 0x111111, 0, 0, 0, { edge: false }); las.rotation.x = Math.PI / 2;
    const jant = FZ.silindir(t, r * 0.6, r * 0.6, w + 0.02, 0xcbd5e1, 0, 0, 0, { edge: false }); jant.rotation.x = Math.PI / 2;
    const gobek = FZ.silindir(t, r * 0.18, r * 0.18, w + 0.05, 0x475569, 0, 0, 0, { edge: false }); gobek.rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) { const k = FZ.kutu(t, r * 1.1, 0.03, w + 0.03, 0x94a3b8, 0, 0, 0, { edge: false }); k.rotation.z = i * Math.PI / 5; }
    t.r = r; return t; };
  // Otomobil: +x yönüne bakar, tabanı y = 0'da; uzunluk ≈ 1,9, genişlik ≈ 0,95
  FZ.araba = (g, renk = 0xef4444) => { const a = new THREE.Group(); g.add(a); const K = FZ.kutu;
    K(a, 1.9, 0.36, 0.92, renk, 0, 0.42, 0);                                    // alt gövde
    K(a, 0.5, 0.06, 0.88, renk, 0.62, 0.62, 0);                                 // kaput
    const kabin = K(a, 0.95, 0.34, 0.84, renk, -0.15, 0.77, 0);                  // kabin
    K(a, 0.9, 0.05, 0.86, renk, -0.15, 0.96, 0);                                // tavan
    const cam = (w, x, rz) => { const c = K(a, 0.04, 0.32, 0.76, 0x7dd3fc, x, 0.78, 0, { op: 0.75, edge: false }); c.rotation.z = rz; };
    cam(0, 0.36, -0.55); cam(0, -0.65, 0.55);                                   // ön ve arka cam
    [-1, 1].forEach(sz => { K(a, 0.38, 0.2, 0.02, 0x7dd3fc, 0.06, 0.8, sz * 0.425, { op: 0.8, edge: false }); K(a, 0.36, 0.2, 0.02, 0x7dd3fc, -0.38, 0.8, sz * 0.425, { op: 0.8, edge: false }); });
    [-1, 1].forEach(sz => { parla(K(a, 0.03, 0.09, 0.2, 0xfef9c3, 0.95, 0.47, sz * 0.3, { edge: false }), 0xfde047, 0.8); parla(K(a, 0.03, 0.08, 0.18, 0xdc2626, -0.95, 0.5, sz * 0.32, { edge: false }), 0xdc2626, 0.6); });
    K(a, 0.07, 0.13, 0.96, 0x334155, 0.97, 0.3, 0, { edge: false }); K(a, 0.07, 0.13, 0.96, 0x334155, -0.97, 0.3, 0, { edge: false }); // tamponlar
    K(a, 0.02, 0.1, 0.3, 0xf8fafc, -1.0, 0.4, 0, { edge: false });               // plaka
    [-1, 1].forEach(sz => K(a, 0.08, 0.05, 0.1, renk, 0.32, 0.66, sz * 0.5, { edge: false }));   // aynalar
    a.tekerler = [[0.6, 0.46], [0.6, -0.46], [-0.6, 0.46], [-0.6, -0.46]].map(([x, z]) => teker(a, 0.22, 0.16, x, 0.22, z));
    return a; };
  // Laboratuvar arabası (dinamik arabası): düz gövde, 4 küçük tekerlek, ön yaylı tampon
  FZ.labArabasi = (g, renk, boy = 1.1) => { const a = new THREE.Group(); g.add(a); const K = FZ.kutu;
    K(a, boy, 0.18, 0.7, renk, 0, 0.24, 0); K(a, boy - 0.1, 0.06, 0.6, 0xe2e8f0, 0, 0.36, 0, { edge: false });
    K(a, boy * 0.45, 0.22, 0.45, 0x64748b, 0, 0.5, 0);                           // üstteki ağırlık
    const yay = FZ.silindir(a, 0.06, 0.06, 0.16, 0x94a3b8, boy / 2 + 0.08, 0.26, 0, { edge: false }); yay.rotation.z = Math.PI / 2;
    K(a, 0.04, 0.18, 0.3, 0x1f2937, -boy / 2 - 0.02, 0.26, 0, { edge: false });
    a.tekerler = [[boy / 2 - 0.18, 0.37], [boy / 2 - 0.18, -0.37], [-boy / 2 + 0.18, 0.37], [-boy / 2 + 0.18, -0.37]].map(([x, z]) => teker(a, 0.12, 0.08, x, 0.12, z));
    return a; };
  FZ.tekerDondur = (a, dx) => { if (a && a.tekerler) a.tekerler.forEach(t => t.rotation.z -= dx / t.r); };
  // Lazer cihazı: +x yönüne ışın verir; ağız (çıkış) yerel x = 0,95
  FZ.lazerCihazi = (g, govde = 0x1f2937) => { const a = new THREE.Group(); g.add(a); const S = FZ.silindir, K = FZ.kutu;
    const b = S(a, 0.3, 0.3, 1.6, govde, 0, 0, 0); b.rotation.z = Math.PI / 2;
    const on = S(a, 0.33, 0.33, 0.12, 0x9ca3af, 0.8, 0, 0); on.rotation.z = Math.PI / 2;
    const agiz = S(a, 0.09, 0.09, 0.14, 0x0f172a, 0.9, 0, 0, { edge: false }); agiz.rotation.z = Math.PI / 2;
    const arka = S(a, 0.31, 0.31, 0.1, 0x6b7280, -0.82, 0, 0); arka.rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) { const k = S(a, 0.315, 0.315, 0.03, 0x374151, -0.5 + i * 0.08, 0, 0, { edge: false }); k.rotation.z = Math.PI / 2; } // soğutma kanatçıkları
    K(a, 0.5, 0.02, 0.26, 0xfacc15, 0.2, 0.3, 0, { edge: false });                    // uyarı etiketi
    K(a, 0.08, 0.021, 0.08, 0x111827, 0.2, 0.31, 0, { edge: false });
    parla(FZ.top(a, 0.04, 0xef4444, -0.6, 0.3, 0.12, { edge: false }), 0xef4444, 1);    // güç ışığı
    K(a, 0.18, 0.32, 0.18, 0x6b7280, -0.4, -0.45, 0); K(a, 0.18, 0.32, 0.18, 0x6b7280, 0.4, -0.45, 0); K(a, 1.2, 0.06, 0.6, 0x4b5563, 0, -0.62, 0); // ayaklar
    return a; };
  // Elektron tabancası: cam tüp, ısıtılan katot (turuncu), hızlandırıcı halkalar; +x yönüne atar
  FZ.elektronTabancasi = (g) => { const a = new THREE.Group(); g.add(a); const S = FZ.silindir, K = FZ.kutu;
    const tup = S(a, 0.28, 0.28, 1.7, 0xbae6fd, 0, 0, 0, { op: 0.35, edge: false }); tup.rotation.z = Math.PI / 2;
    const taban = S(a, 0.32, 0.32, 0.25, 0x374151, -0.9, 0, 0); taban.rotation.z = Math.PI / 2;
    parla(S(a, 0.08, 0.08, 0.25, 0xf97316, -0.65, 0, 0, { edge: false }), 0xf97316, 1).rotation.z = Math.PI / 2; // katot
    for (let i = 0; i < 3; i++) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 24), new THREE.MeshLambertMaterial({ color: 0xb45309 })); h.rotation.y = Math.PI / 2; h.position.x = -0.25 + i * 0.3; a.add(h); }
    K(a, 0.18, 0.4, 0.18, 0x6b7280, -0.4, -0.45, 0); K(a, 0.18, 0.4, 0.18, 0x6b7280, 0.4, -0.45, 0); K(a, 1.2, 0.06, 0.6, 0x4b5563, 0, -0.66, 0);
    const kablo = S(a, 0.04, 0.04, 0.8, 0x111827, -1.2, -0.3, 0, { edge: false }); kablo.rotation.z = 0.9;
    return a; };
  // Dedektör: gövde, mercekli algılayıcı (−x yönüne bakar), yeşil sayısal ekran, ayak
  FZ.dedektor = (g, olcek = 1) => { const a = new THREE.Group(); a.scale.setScalar(olcek); g.add(a); const S = FZ.silindir, K = FZ.kutu;
    K(a, 0.6, 0.5, 0.5, 0x334155, 0, 0, 0);
    const bas = S(a, 0.17, 0.22, 0.25, 0x111827, -0.42, 0, 0); bas.rotation.z = -Math.PI / 2;
    FZ.top(a, 0.15, 0x60a5fa, -0.55, 0, 0, { op: 0.7, edge: false });
    parla(K(a, 0.36, 0.16, 0.02, 0x22c55e, 0.02, 0.08, 0.26, { edge: false }), 0x22c55e, 0.9);
    parla(FZ.top(a, 0.035, 0xef4444, 0.22, -0.12, 0.26, { edge: false }), 0xef4444, 1);
    K(a, 0.08, 0.5, 0.08, 0x6b7280, 0, -0.5, 0); K(a, 0.4, 0.05, 0.4, 0x4b5563, 0, -0.75, 0);
    return a; };

  // ---------- Hafif ama gerçeğe benzeyen modeller (az parça, düşük çözünürlük) ----------
  const M = (geo, renk, ops) => FZ.mesh(geo, renk, Object.assign({ edge: false }, ops || {}));
  const ekle = (a, m, x, y, z) => { m.position.set(x, y, z); a.add(m); return m; };
  // Kalem pil: ekseni y, (+) ucu yukarıda. a.arti / a.eksi: yerel uç noktaları
  FZ.pil = (g, h = 1) => { const a = new THREE.Group(); g.add(a); const r = h * 0.2;
    ekle(a, M(new THREE.CylinderGeometry(r, r, h * 0.62, 18), 0x1f2937), 0, -h * 0.17, 0);          // siyah gövde
    ekle(a, M(new THREE.CylinderGeometry(r, r, h * 0.32, 18), 0xd97706), 0, h * 0.3, 0);             // bakır bant
    ekle(a, M(new THREE.CylinderGeometry(r * 0.96, r * 0.96, h * 0.03, 18), 0xd1d5db), 0, h * 0.475, 0);
    ekle(a, M(new THREE.CylinderGeometry(r * 0.38, r * 0.4, h * 0.07, 14), 0xe5e7eb), 0, h * 0.52, 0);  // (+) düğmesi
    ekle(a, M(new THREE.CylinderGeometry(r * 0.9, r * 0.9, h * 0.03, 18), 0xd1d5db), 0, -h * 0.49, 0);  // (−) düz uç
    const cizgi = (w, hh, renk, y, rz) => { const m = ekle(a, M(new THREE.BoxGeometry(w, hh, 0.01), renk), 0, y, r * 1.01); m.rotation.z = rz || 0; };
    cizgi(h * 0.14, h * 0.03, 0x111827, h * 0.3); cizgi(h * 0.03, h * 0.14, 0x111827, h * 0.3);   // + işareti (bakır bantta)
    cizgi(h * 0.14, h * 0.03, 0xf8fafc, -h * 0.32);                                              // − işareti (siyah gövdede)
    a.arti = V3(0, h * 0.56, 0); a.eksi = V3(0, -h * 0.5, 0); return a; };
  // Ampul: duy (vida dişli) altta y = 0, cam armut biçimli; a.parla(0..1)
  FZ.ampul = (g, s = 1) => { const a = new THREE.Group(); a.scale.setScalar(s); g.add(a);
    ekle(a, M(new THREE.CylinderGeometry(0.05, 0.07, 0.06, 10), 0x111827), 0, 0.03, 0);
    ekle(a, M(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 14), 0xb8bec7), 0, 0.17, 0);
    for (let i = 0; i < 3; i++) { const t = M(new THREE.TorusGeometry(0.122, 0.014, 5, 16), 0x9ca3af); t.rotation.x = Math.PI / 2; ekle(a, t, 0, 0.1 + i * 0.06, 0); }
    const pr = [[0.12, 0.28], [0.13, 0.36], [0.24, 0.5], [0.29, 0.62], [0.27, 0.74], [0.18, 0.84], [0, 0.89]].map(([x, y]) => new THREE.Vector2(x, y));
    const cam = ekle(a, new THREE.Mesh(new THREE.LatheGeometry(pr, 18), new THREE.MeshLambertMaterial({ color: 0xe5e7eb, transparent: true, opacity: 0.45, emissive: new THREE.Color(0xfacc15), emissiveIntensity: 0, depthWrite: false })), 0, 0, 0);
    [-0.05, 0.05].forEach(x => ekle(a, M(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4), 0x6b7280), x, 0.44, 0));
    const tel = ekle(a, M(new THREE.TorusGeometry(0.05, 0.012, 4, 10, Math.PI), 0x92400e), 0, 0.59, 0);   // tel (filaman)
    const hale = ekle(a, new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0, depthWrite: false })), 0, 0.6, 0);
    a.cam = cam; a.hale = hale;
    a.parla = p => { p = Math.max(0, Math.min(1, p)); cam.material.emissiveIntensity = 1.3 * p; cam.material.opacity = 0.45 + 0.4 * p; tel.material.emissive = tel.material.emissive || new THREE.Color(); tel.material.emissive.setHex(0xfbbf24); tel.material.emissiveIntensity = 2 * p; hale.material.opacity = 0.4 * p; hale.scale.setScalar(0.6 + 0.8 * p); };
    a.parla(0); return a; };
  // İnsan (kurşun asker gibi): ayaklar y = 0, boy ≈ 1,8·b, +x yönüne bakar; a.kollar
  // İnsan (kurşun asker sadeliğinde): ayaklar y = 0, boy ≈ 1,8·b, +x yönüne bakar; kiz: uzun saç + at kuyruğu + etek; a.kollar
  FZ.insan = (g, renk = 0x2563eb, b = 1, kiz = false) => { const a = new THREE.Group(); a.scale.setScalar(b); g.add(a);
    const TEN = 0xf1c27d, SAC = kiz ? 0x5b3a1e : 0x2b1d12;
    [-0.1, 0.1].forEach(z => { ekle(a, M(new THREE.CylinderGeometry(kiz ? 0.055 : 0.075, kiz ? 0.05 : 0.07, 0.8, 8), kiz ? TEN : 0x1f3a6b), 0, 0.42, z); ekle(a, M(new THREE.BoxGeometry(0.22, 0.08, 0.12), kiz ? 0xbe185d : 0x111827), 0.04, 0.04, z); });
    if (kiz) ekle(a, M(new THREE.CylinderGeometry(0.19, 0.32, 0.42, 14), renk), 0, 0.78, 0);       // etek
    else ekle(a, M(new THREE.CylinderGeometry(0.2, 0.18, 0.16, 10), 0x1f3a6b), 0, 0.84, 0);        // pantolon üstü
    ekle(a, M(new THREE.CylinderGeometry(kiz ? 0.16 : 0.21, kiz ? 0.15 : 0.17, 0.6, 10), renk), 0, 1.15, 0);   // gövde (erkekte omuz geniş)
    a.kollar = [-1, 1].map(sz => { const k = new THREE.Group(); k.position.set(0, 1.38, sz * (kiz ? 0.21 : 0.27)); a.add(k); ekle(k, M(new THREE.CylinderGeometry(0.055, 0.05, 0.6, 7), kiz ? TEN : renk), 0, -0.3, 0); ekle(k, M(new THREE.SphereGeometry(0.06, 8, 6), TEN), 0, -0.62, 0); return k; });
    ekle(a, M(new THREE.CylinderGeometry(0.055, 0.06, 0.09, 8), TEN), 0, 1.47, 0);
    ekle(a, M(new THREE.SphereGeometry(0.15, 14, 12), TEN), 0, 1.63, 0);                              // baş
    ekle(a, M(new THREE.SphereGeometry(0.158, 14, 10, 0, Math.PI * 2, 0, kiz ? 1.9 : 1.25), SAC), -0.012, 1.64, 0);   // saç
    if (kiz) { const at = ekle(a, M(new THREE.CylinderGeometry(0.06, 0.03, 0.42, 8), SAC), -0.2, 1.48, 0); at.rotation.z = -0.35;   // at kuyruğu
      ekle(a, M(new THREE.SphereGeometry(0.04, 8, 6), 0xec4899), -0.15, 1.7, 0); }                  // toka
    [-0.05, 0.05].forEach(z => ekle(a, M(new THREE.SphereGeometry(0.018, 5, 4), 0x111827), 0.14, 1.65, z));   // gözler
    const agiz = ekle(a, M(new THREE.TorusGeometry(0.035, 0.008, 4, 10, Math.PI), 0xb91c1c), 0.145, 1.585, 0); agiz.rotation.set(0, Math.PI / 2, Math.PI);
    a.kiz = kiz; return a; };
  FZ.kiz = (g, renk = 0xdb2777, b = 1) => FZ.insan(g, renk, b, true);
  // Lokomotif: +x yönüne bakar, tekerlek altı y = 0, boy ≈ 3
  FZ.tren = (g, renk = 0xdc2626) => { const a = new THREE.Group(); g.add(a);
    ekle(a, M(new THREE.BoxGeometry(3, 0.16, 0.9), 0x1f2937), 0, 0.3, 0);                            // şasi
    ekle(a, M(new THREE.BoxGeometry(2.4, 0.95, 0.86), renk, { edge: true }), -0.25, 0.86, 0);          // gövde
    const tav = M(new THREE.CylinderGeometry(0.43, 0.43, 2.4, 14), 0xe5e7eb); tav.rotation.z = Math.PI / 2; tav.scale.x = 0.35; ekle(a, tav, -0.25, 1.33, 0);   // kubbeli tavan
    ekle(a, M(new THREE.BoxGeometry(0.6, 0.95, 0.86), renk, { edge: true }), 1.25, 0.86, 0);          // burun
    const on = M(new THREE.BoxGeometry(0.05, 0.4, 0.7), 0x7dd3fc, { op: 0.8 }); on.rotation.z = -0.35; ekle(a, on, 1.48, 1.08, 0);   // ön cam
    ekle(a, M(new THREE.BoxGeometry(0.06, 0.12, 0.3), 0xfef08a), 1.53, 0.55, 0);                      // far
    for (let i = 0; i < 4; i++) [-1, 1].forEach(sz => ekle(a, M(new THREE.BoxGeometry(0.34, 0.26, 0.02), 0x7dd3fc, { op: 0.85 }), -1.15 + i * 0.5, 1.02, sz * 0.435));   // yan pencereler
    [-1, 1].forEach(sz => ekle(a, M(new THREE.BoxGeometry(2.9, 0.05, 0.02), 0xfacc15), 0, 0.6, sz * 0.435));                       // şerit
    a.tekerler = []; [-1.05, -0.6, 0.6, 1.05].forEach(x => [-0.4, 0.4].forEach(z => { const t = M(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12), 0x374151); t.rotation.x = Math.PI / 2; a.tekerler.push(ekle(a, t, x, 0.2, z)); }));
    return a; };
  // Raylar: x boyunca, uzunluk L
  FZ.ray = (g, L, x = 0, z = 0) => { const a = new THREE.Group(); a.position.set(x, 0, z); g.add(a);
    [-0.4, 0.4].forEach(zz => ekle(a, M(new THREE.BoxGeometry(L, 0.06, 0.06), 0x9ca3af), 0, 0.06, zz));
    for (let i = 0; i < L / 0.5; i++) ekle(a, M(new THREE.BoxGeometry(0.14, 0.04, 1.1), 0x78350f), -L / 2 + 0.25 + i * 0.5, 0.02, 0);
    return a; };
  // Yolcu uçağı: +x yönüne bakar, gövde ekseni y = 0,5, boy ≈ 3
  FZ.ucak = (g, renk = 0x2563eb) => { const a = new THREE.Group(); g.add(a);
    const gv = M(new THREE.CapsuleGeometry(0.22, 2.4, 4, 12), 0xf1f5f9); gv.rotation.z = Math.PI / 2; ekle(a, gv, 0, 0.5, 0);
    [-1, 1].forEach(sz => { const k = M(new THREE.BoxGeometry(0.7, 0.05, 1.5), 0xcbd5e1); k.rotation.y = sz * 0.35; ekle(a, k, -0.05, 0.42, sz * 0.85); });   // ok biçimli kanatlar
    const ku = M(new THREE.BoxGeometry(0.5, 0.6, 0.05), renk); ku.rotation.z = 0.4; ekle(a, ku, -1.25, 0.85, 0);                    // dikey kuyruk
    ekle(a, M(new THREE.BoxGeometry(0.4, 0.04, 1.1), 0xcbd5e1), -1.3, 0.55, 0);                       // yatay kuyruk
    [-0.85, 0.85].forEach(z => { const m = M(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 10), 0x64748b); m.rotation.z = Math.PI / 2; ekle(a, m, 0.25, 0.3, z); });   // motorlar
    ekle(a, M(new THREE.BoxGeometry(2.3, 0.05, 0.02), renk), 0, 0.42, 0.22); ekle(a, M(new THREE.BoxGeometry(2.3, 0.05, 0.02), renk), 0, 0.42, -0.22);   // şerit
    for (let i = 0; i < 8; i++) [-1, 1].forEach(sz => ekle(a, M(new THREE.BoxGeometry(0.07, 0.07, 0.02), 0x1e3a8a), -0.8 + i * 0.22, 0.58, sz * 0.215));   // pencereler
    ekle(a, M(new THREE.BoxGeometry(0.16, 0.08, 0.3), 0x1e3a8a), 1.33, 0.6, 0);                       // kokpit camı
    return a; };
  // Asfalt yol: x boyunca, uzunluk L, genişlik W; kesik orta çizgi ve kenar çizgileri
  FZ.yol = (g, L, W = 1.4, x = 0, z = 0) => { const a = new THREE.Group(); a.position.set(x, 0, z); g.add(a);
    ekle(a, M(new THREE.BoxGeometry(L, 0.03, W), 0x3f3f46, { cast: false }), 0, 0.015, 0);
    [-1, 1].forEach(sz => ekle(a, M(new THREE.BoxGeometry(L, 0.005, 0.05), 0xf8fafc, { cast: false }), 0, 0.034, sz * (W / 2 - 0.08)));
    for (let i = 0; i < L / 0.8; i++) ekle(a, M(new THREE.BoxGeometry(0.4, 0.005, 0.05), 0xfacc15, { cast: false }), -L / 2 + 0.3 + i * 0.8, 0.034, 0);
    return a; };
  // Fotoğraf makinesi / kamera: objektif +x yönünde
  FZ.kamera = (g) => { const a = new THREE.Group(); g.add(a);
    ekle(a, M(new THREE.BoxGeometry(0.5, 0.36, 0.7), 0x1f2937), 0, 0, 0);
    const ob = M(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 14), 0x111827); ob.rotation.z = Math.PI / 2; ekle(a, ob, 0.38, 0, 0.05);
    const ln = M(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 14), 0x3b82f6); ln.rotation.z = Math.PI / 2; ekle(a, ln, 0.54, 0, 0.05);
    ekle(a, M(new THREE.BoxGeometry(0.22, 0.12, 0.2), 0x374151), -0.02, 0.24, -0.15);                  // vizör
    ekle(a, M(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), 0xdc2626), 0.05, 0.2, 0.22);          // deklanşör
    return a; };
  // Basmalı tuş (anahtar düğmesi): kaide + kırmızı başlık; a.bas(0..1)
  FZ.tus = (g, renk = 0xdc2626) => { const a = new THREE.Group(); g.add(a);
    ekle(a, M(new THREE.BoxGeometry(0.5, 0.12, 0.5), 0x374151), 0, 0.06, 0);
    ekle(a, M(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 14), 0x9ca3af), 0, 0.14, 0);
    const b = ekle(a, M(new THREE.CylinderGeometry(0.13, 0.14, 0.12, 14), renk), 0, 0.22, 0);
    a.bas = p => { b.position.y = 0.22 - 0.06 * p; }; return a; };

  // ---------- Gerçekçilik: metal, mum, göz, ocak, terazi, ağırlık, fener, gökada, dambıl ----------
  // Parlak metal malzeme (ışık yansıması görünür)
  FZ.metal = (renk = 0xc0c7d1, op) => new THREE.MeshPhongMaterial({ color: renk, specular: 0xffffff, shininess: 90, transparent: !!op, opacity: op || 1, depthWrite: !op });
  FZ.metalTop = (g, r, x, y, z, renk) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), FZ.metal(renk)); m.castShadow = true; m.position.set(x, y, z); g.add(m); return m; };
  // Yalıtkan ayak: şeffaf pleksi çubuk + siyah taban (yüksekliği h, üst ucu y = h)
  FZ.yalitkanAyak = (g, x, h, z = 0) => { const a = new THREE.Group(); a.position.set(x, 0, z); g.add(a);
    ekle(a, M(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 18), 0x1f2937), 0, 0.04, 0);
    const c = ekle(a, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 10), new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.6, shininess: 80 })), 0, h / 2, 0); a.cubuk = c; return a; };
  // Mum: tabanı y = 0, boy h; a.alev
  FZ.mum = (g, h = 1.2, op) => { const a = new THREE.Group(); g.add(a); const o = op ? { op } : {};
    ekle(a, M(new THREE.CylinderGeometry(0.25, 0.27, 0.06, 16), 0xb45309, o), 0, 0.03, 0);                  // tabak
    ekle(a, M(new THREE.CylinderGeometry(0.15, 0.16, h, 14), 0xfef3c7, o), 0, h / 2 + 0.05, 0);              // mum
    ekle(a, M(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 5), 0x111827, o), 0, h + 0.1, 0);                // fitil
    const al = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: !!op, opacity: op || 1 })); al.scale.set(1, 2.2, 1); ekle(a, al, 0, h + 0.24, 0);
    const ic = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: !!op, opacity: op || 1 })); ic.scale.set(1, 1.8, 1); ekle(a, ic, 0, h + 0.2, 0);
    a.alev = al; return a; };
  // Göz: +x yönüne bakar
  FZ.goz = (g, r = 0.25) => { const a = new THREE.Group(); g.add(a);
    ekle(a, M(new THREE.SphereGeometry(r, 18, 14), 0xf8fafc), 0, 0, 0);
    const ir = M(new THREE.CircleGeometry(r * 0.48, 18), 0x2563eb); ir.rotation.y = Math.PI / 2; ekle(a, ir, r * 0.97, 0, 0);
    const bb = M(new THREE.CircleGeometry(r * 0.22, 14), 0x0b0f19); bb.rotation.y = Math.PI / 2; ekle(a, bb, r * 0.99, 0, 0);
    const kp = M(new THREE.SphereGeometry(r * 1.06, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.32), 0xf1c27d); ekle(a, kp, 0, 0, 0);   // göz kapağı
    return a; };
  // Ocak (tek gözlü ocak): üst yüzeyi y = 0,3; a.alev (mavi gaz alevi halkası)
  FZ.ocak = (g, s = 1) => { const a = new THREE.Group(); a.scale.setScalar(s); g.add(a);
    ekle(a, M(new THREE.BoxGeometry(1.3, 0.28, 1.3), 0xe5e7eb, { edge: true }), 0, 0.14, 0);
    ekle(a, M(new THREE.BoxGeometry(1.2, 0.02, 1.2), 0x111827), 0, 0.29, 0);
    ekle(a, M(new THREE.CylinderGeometry(0.24, 0.26, 0.06, 16), 0x374151), 0, 0.32, 0);                       // bek
    for (let i = 0; i < 4; i++) { const k = M(new THREE.BoxGeometry(1.0, 0.04, 0.05), 0x1f2937); k.rotation.y = i * Math.PI / 4; ekle(a, k, 0, 0.36, 0); }   // ızgara
    [-0.35, 0.35].forEach(x => { const d = M(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), 0x111827); d.rotation.x = Math.PI / 2; ekle(a, d, x, 0.14, 0.66); });   // düğmeler
    const al = ekle(a, new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 20), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.85 })), 0, 0.37, 0); al.rotation.x = Math.PI / 2;
    a.alev = al; return a; };
  // Dijital terazi: kefe üst yüzeyi y = 0,3; a.ekran yerel konumu (etiket için)
  FZ.terazi = (g) => { const a = new THREE.Group(); g.add(a);
    ekle(a, M(new THREE.BoxGeometry(1.5, 0.22, 1.2), 0x334155, { edge: true }), 0, 0.11, 0);
    ekle(a, M(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24), 0xd1d5db), 0, 0.27, -0.05);                      // kefe
    const ek = M(new THREE.BoxGeometry(0.6, 0.12, 0.02), 0x14532d); ekle(a, ek, 0, 0.12, 0.61); ek.material.emissive = new THREE.Color(0x22c55e); ek.material.emissiveIntensity = 0.4;
    [-0.5, 0.5].forEach(x => ekle(a, M(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), 0x9ca3af), x, 0.12, 0.61));
    return a; };
  // Kancalı ağırlık (laboratuvar kütlesi): tabanı y = 0, boy ≈ h
  FZ.agirlik = (g, renk = 0x9ca3af, h = 0.6, r = 0.25) => { const a = new THREE.Group(); g.add(a);
    const gv = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.75, 20), FZ.metal(renk)); gv.castShadow = true; ekle(a, gv, 0, h * 0.375, 0);
    for (let i = 1; i < 3; i++) ekle(a, M(new THREE.CylinderGeometry(r * 1.01, r * 1.01, 0.012, 20), 0x475569), 0, h * 0.25 * i, 0);   // dilim çizgileri
    ekle(a, M(new THREE.CylinderGeometry(0.03, 0.03, h * 0.2, 6), 0x6b7280), 0, h * 0.85, 0);
    const k = ekle(a, M(new THREE.TorusGeometry(0.07, 0.018, 6, 12), 0x6b7280), 0, h * 0.98, 0); return a; };
  // El feneri / ışık kaynağı: +x yönüne ışık verir, ağız yerel x = 0,55
  FZ.fener = (g, renk = 0x334155) => { const a = new THREE.Group(); g.add(a);
    const gv = M(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 14), renk); gv.rotation.z = Math.PI / 2; ekle(a, gv, -0.1, 0, 0);
    const bas = M(new THREE.CylinderGeometry(0.3, 0.18, 0.3, 16), renk); bas.rotation.z = -Math.PI / 2; ekle(a, bas, 0.4, 0, 0);
    const cm = new THREE.Mesh(new THREE.CircleGeometry(0.27, 18), new THREE.MeshBasicMaterial({ color: 0xfef9c3 })); cm.rotation.y = Math.PI / 2; ekle(a, cm, 0.56, 0, 0);
    ekle(a, M(new THREE.BoxGeometry(0.1, 0.05, 0.08), 0xdc2626), -0.1, 0.17, 0);                                // düğme
    a.cam = cm; return a; };
  // Gökada (sarmal disk): düz, parlak çekirdek
  FZ.gokada = (g, renk = 0x93c5fd, s = 1) => { const a = new THREE.Group(); a.scale.setScalar(s); g.add(a);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20), new THREE.MeshBasicMaterial({ color: renk, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); d.rotation.x = -Math.PI / 2; a.add(d);
    for (let k = 0; k < 2; k++) { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, r = 0.06 + 0.26 * t, an = k * Math.PI + t * 4; pts.push(V3(Math.cos(an) * r, 0.01, Math.sin(an) * r)); }
      a.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff }))); }
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff7d6 })); c.scale.y = 0.6; a.add(c);
    a.disk = d; a.cekirdek = c; return a; };
  // Dambıl: ekseni x
  FZ.dambil = (g, renk = 0xef4444) => { const a = new THREE.Group(); g.add(a);
    const b = M(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 8), 0x9ca3af); b.rotation.x = Math.PI / 2; a.add(b);
    [-0.15, 0.15].forEach(z => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), FZ.metal(renk)); t.rotation.x = Math.PI / 2; ekle(a, t, 0, 0, z); });
    return a; };
  // Kıvrımlı helezon yay: +x yönünde 1 birim uzunlukta; boyu scale.x ile ayarlanır (sıkışınca sarımlar sıklaşır)
  FZ.yay = (g, r = 0.2, sarim = 10, renk = 0x9ca3af, kalin = 0.03) => { const a = new THREE.Group(); g.add(a); const pts = [], n = sarim * 24;
    for (let i = 0; i <= n; i++) { const u = i / n, t = u * sarim * Math.PI * 2; pts.push(V3(u, Math.sin(t) * r, Math.cos(t) * r)); }
    a.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, kalin, 6, false), FZ.metal ? FZ.metal(renk) : new THREE.MeshLambertMaterial({ color: renk })));
    return a; };
  // İnsan kolunu dünya koordinatındaki bir noktaya uzat (i: 0 sol, 1 sağ)
  FZ.koluUzat = (ins, i, hedef) => { const k = ins.kollar[i]; ins.updateMatrixWorld(true); const omz = k.getWorldPosition(V3()); const yerel = ins.worldToLocal(hedef.clone()), oml = ins.worldToLocal(omz.clone()), d = yerel.sub(oml);
    const L = d.length(); k.rotation.set(Math.atan2(-d.z, Math.hypot(d.x, -d.y)) * 0, 0, 0); const dir = d.clone().normalize();
    k.quaternion.setFromUnitVectors(V3(0, -1, 0), dir); k.scale.set(1, Math.max(0.3, L / 0.65), 1); };

  // ---------- Dokular (hafif, tuval ile üretilir; bir kez oluşturulur) ----------
  const DOKU = {};
  const tuval = (w, h, ciz) => { const c = document.createElement('canvas'); c.width = w; c.height = h; ciz(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const rnd = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(12345);
  FZ.doku = ad => DOKU[ad] || (DOKU[ad] = ({
    tugla: () => tuval(128, 64, (x, w, h) => { x.fillStyle = '#b5482e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = rnd(); x.fillStyle = v < .5 ? 'rgba(90,25,15,.25)' : 'rgba(230,140,100,.22)'; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
      x.strokeStyle = 'rgba(70,20,10,.35)'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); }),
    sunger: () => tuval(128, 128, (x, w, h) => { x.fillStyle = '#f7d23a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { const r = .8 + rnd() * 2.6; x.fillStyle = rnd() < .7 ? 'rgba(180,140,10,.55)' : 'rgba(255,240,140,.6)'; x.beginPath(); x.arc(rnd() * w, rnd() * h, r, 0, 6.3); x.fill(); } }),
    ovma: () => tuval(64, 64, (x, w, h) => { x.fillStyle = '#2f7d32'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(20,60,20,.7)'; for (let i = 0; i < 120; i++) { x.beginPath(); const a = rnd() * w, b = rnd() * h; x.moveTo(a, b); x.lineTo(a + (rnd() - .5) * 14, b + (rnd() - .5) * 14); x.stroke(); } }),
    tahta: () => tuval(128, 64, (x, w, h) => { x.fillStyle = '#b5844f'; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(110,70,30,${.15 + rnd() * .25})`; x.lineWidth = 1 + rnd() * 2; x.beginPath(); const y = rnd() * h; x.moveTo(0, y); x.bezierCurveTo(w * .3, y + (rnd() - .5) * 8, w * .7, y + (rnd() - .5) * 8, w, y + (rnd() - .5) * 6); x.stroke(); } }),
    beton: () => tuval(128, 128, (x, w, h) => { x.fillStyle = '#9ca3af'; x.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { x.fillStyle = rnd() < .5 ? 'rgba(60,60,70,.18)' : 'rgba(240,240,245,.18)'; x.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } }),
    metalFirca: () => tuval(128, 32, (x, w, h) => { x.fillStyle = '#c7ccd4'; x.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(${rnd() < .5 ? '90,95,105' : '250,250,255'},.25)`; x.beginPath(); const y = rnd() * h; x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } }),
  })[ad]());
  FZ.dokuMat = (ad, ops = {}) => new THREE.MeshStandardMaterial(Object.assign({ map: FZ.doku(ad), roughness: .85, metalness: 0 }, ops));
  // Tuğla: delikli harman tuğlası görünümü; boyutlar w (x), h (y), d (z)
  FZ.tugla = (g, w = 1, h = .5, d = .25) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), FZ.dokuMat('tugla')); m.castShadow = m.receiveShadow = true; g.add(m); return m; };

  // Ölçek yazısı: ön yüze bakan küçük, şeffaf zeminli sayı (dereceli silindir, termometre, cetvel…)
  FZ.yazi = (g, txt, x, y, z, boy = 0.16, renk = '#111827', zemin = 'rgba(255,255,255,0.88)') => { const c = document.createElement('canvas'), w = 256, h = 96; c.width = w; c.height = h; const k = c.getContext('2d');
    let fp = 64; k.font = '900 64px Inter, sans-serif'; while (fp > 24 && k.measureText(txt).width > w - 28) { fp -= 4; k.font = `900 ${fp}px Inter, sans-serif`; }   // uzun yazı küçülerek sığar
    const tw = Math.min(w - 8, k.measureText(txt).width + 24); k.fillStyle = zemin; k.beginPath(); k.roundRect((w - tw) / 2, 8, tw, h - 16, 18); k.fill();
    k.fillStyle = renk; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(txt, w / 2, h / 2 + 4);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(boy * w / h, boy), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    m.position.set(x, y, z); m.userData.golgesiz = true; g.add(m); return m; };
  // Dikey ölçek: [[y, 'yazı'], …] noktalarına çentik + yazı
  FZ.olcek = (g, x, z, L, yon = -1, boy = 0.15) => L.forEach(([y, t]) => { FZ.kutu(g, 0.12, 0.018, 0.02, 0x111827, x, y, z, { edge: false }); FZ.yazi(g, t, x + yon * (0.06 + boy * 1.3), y, z + 0.01, boy); });
})();
