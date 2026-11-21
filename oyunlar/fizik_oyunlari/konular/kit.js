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
})();
