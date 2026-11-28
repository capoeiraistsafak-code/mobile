// Kitap soru bankası · TYT OPTİK (ışık şiddeti–aydınlanma, gölge, düzlem ayna, küresel ayna, kırılma, renkler, mercekler)
// Benim Hocam TYT s.157–210'daki SORU TİPLERİ örnek alınmıştır; sorular, sayılar ve durumlar özgündür.
// Sahne "Optik laboratuvarı": her soru kendi düzeneğini kurar (S.mod) ve ışınlar fizik kurallarına göre hesaplanarak çizilir.
(function () {
  const { V3, sahne, gorev, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const Y0 = 1.6;                                  // asal eksen yüksekliği
  const RENK = { k: 0xef4444, y: 0x22c55e, m: 0x3b82f6 };

  const sOp = sahne({ icon: '🔦', cam: [[0, 2.8, 12.5], [0, 1.6, 0]], plate: [16, 8, 0, 0],
    data: [['Aydınlanma', 'E = I / d²'], ['Ayna/mercek', '1/f = 1/u + 1/v'], ['Kırılma', 'n₁ sin i = n₂ sin r']],
    S0: () => ({ mod: 'ayna', d: 2, aci: 60, f: 1.5, u: 4.5, ho: 1, tur: 'cukur', n1: 1, n2: 1.33, i: 45, isik: 'k', cisim: 'k', a: 0, r: 0.35, xe: -1, xp: 4.5, I: 100, h: 2, ilk: 1 }),
    cam2: S => S.mod === 'golge' ? [[-3.5, 4.2, 10.5], [1.2, 1.6, 0]] : S.mod === 'aydin' ? [[0, 3.2, 10], [0, 1.8, 0]] : S.mod === 'isik' ? [[0, 2.6, 8.5], [0, 1.3, 0]] : S.mod === 'kure' ? [[-1.6, 2.6, 12], [-1.6, 1.6, 0]] : S.mod === 'ayna' ? [[0, 4.5, 10], [0, 1.2, 0]] : [[0, 2.6, 12], [0, 1.6, 0]],
    kur(g) {
      const T = {};
      const isin = (renk, kesik) => { const l = kesik ? FZ.dashLine(renk) : new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(), V3(0, 1, 0)]), new THREE.LineBasicMaterial({ color: renk })); l.visible = false; g.add(l); return l; };
      T.ray = [0xfacc15, 0xfacc15, 0xfacc15, 0x22d3ee, 0x22d3ee].map(r => isin(r)); T.sanal = [0, 1, 2].map(() => isin(0x94a3b8, true));
      T.eksen = isin(0xe5e7eb, true); T.normal = isin(0xffffff, true);
      T.spekt = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x3b82f6, 0x4f46e5, 0xa855f7].map(r => isin(r));
      // düzlem ayna + açılı ikinci ayna
      T.ayna = new THREE.Group(); g.add(T.ayna); kutu(T.ayna, 0.12, 2.6, 2.4, 0xbfdbfe, 0, 1.3, 0, { op: 0.7 }); kutu(T.ayna, 0.06, 2.6, 2.4, 0x475569, 0.09, 1.3, 0);
      T.ayna2 = new THREE.Group(); g.add(T.ayna2); kutu(T.ayna2, 0.12, 2.6, 2.4, 0xbfdbfe, 0, 1.3, 1.2, { op: 0.7 }); kutu(T.ayna2, 0.06, 2.6, 2.4, 0x475569, 0.09, 1.3, 1.2);   // menteşe z = 0'da
      // küresel ayna (yay biçimli parlak yüzey) — çukur ve tümsek ayrı
      const yay = (sgn) => { const R = 3, pts = []; for (let k = -12; k <= 12; k++) { const a = k / 12 * 0.5; pts.push(V3(sgn * (-R + R * Math.cos(a)), Y0 + R * Math.sin(a), 0)); }
        const grp = new THREE.Group(); g.add(grp); const c = new THREE.CatmullRomCurve3(pts);
        grp.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.07, 8), new THREE.MeshPhongMaterial({ color: 0xe2e8f0, shininess: 120, specular: 0xffffff })));
        const arka = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => p.clone().add(V3(0.1, 0, 0)))), 40, 0.05, 6), new THREE.MeshLambertMaterial({ color: 0x334155 })); grp.add(arka); return grp; };
      T.cukur = yay(1); T.tumsek = yay(-1);
      // mercekler: ince kenarlı (yakınsak) ve kalın kenarlı (ıraksak)
      const mercek = pr => { const m = new THREE.Mesh(new THREE.LatheGeometry(pr.map(([r, y]) => new THREE.Vector2(r, y)), 32), new THREE.MeshPhongMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.55, shininess: 120, side: THREE.DoubleSide }));
        m.rotation.z = Math.PI / 2; m.position.set(0, Y0, 0); g.add(m); return m; };
      T.ince = mercek([[0, 0.24], [0.7, 0.17], [1.2, 0.05], [1.25, 0], [1.2, -0.05], [0.7, -0.17], [0, -0.24]]);
      T.kalin = mercek([[0, 0.06], [0.7, 0.13], [1.2, 0.26], [1.25, 0.26], [1.25, -0.26], [1.2, -0.26], [0.7, -0.13], [0, -0.06]]);
      // cisim ve görüntü: mum (görüntü soluk, gerekirse ters)
      T.cis = FZ.mum(g, 1); T.gor = FZ.mum(g, 1, 0.35);
      // kırılma: iki ortam
      T.ust = kutu(g, 8, 2.2, 1.2, 0xe0f2fe, 0, Y0 + 1.1, -0.65, { op: 0.12, edge: false }); T.alt = kutu(g, 8, 2.2, 1.2, 0x3b82f6, 0, Y0 - 1.1, -0.65, { op: 0.35, edge: false });
      T.lazer = FZ.lazerCihazi(g);
      // prizma
      T.prizma = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.4, 3), new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.5, shininess: 120, side: THREE.DoubleSide })); T.prizma.position.set(0, Y0, 0); T.prizma.rotation.x = Math.PI / 2; g.add(T.prizma);   // üçgen cam prizma
      // renkli ışık altında cisim
      T.fener = FZ.fener(g); T.konik = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); g.add(T.konik);
      T.top = top(g, 0.55, 0xef4444, 0, 0.6, 0); T.masa = kutu(g, 3.4, 0.14, 2, 0x92400e, 0, 0, 0);
      // gölge: kaynak, engel, perde
      T.amp = FZ.ampul(g, 0.9); T.kaynak = top(g, 0.4, 0xfde047, 0, Y0, 0, { edge: false }); T.kaynak.material.emissive = new THREE.Color(0xfacc15); T.kaynak.material.emissiveIntensity = 0.9;
      T.engel = top(g, 0.35, 0x1e293b, 0, Y0, 0); T.perde = kutu(g, 0.08, 3.6, 3.6, 0xf8fafc, 4.5, Y0, 0);
      const disk = (renk, op) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: renk, transparent: true, opacity: op, depthWrite: false })); m.rotation.y = -Math.PI / 2; g.add(m); return m; };
      T.yari = disk(0x64748b, 0.55); T.tam = disk(0x0f172a, 0.95);
      T.F1 = top(g, 0.07, 0xf97316, 0, Y0, 0, { edge: false }); T.F2 = top(g, 0.07, 0xf97316, 0, Y0, 0, { edge: false }); T.M1 = top(g, 0.07, 0xa855f7, 0, Y0, 0, { edge: false }); T.M2 = top(g, 0.07, 0xa855f7, 0, Y0, 0, { edge: false });
      ['opA', 'opB', 'opC', 'opD', 'opE', 'opF'].forEach((id, i) => kart(id, '', ['#F5C400', '#22c55e', '#3b82f6', '#ef4444', '#f97316', '#a855f7'][i]));
      return T;
    },
    tick(S, dt, T) {
      const hepsi = [T.ayna, T.ayna2, T.cukur, T.tumsek, T.ince, T.kalin, T.cis, T.gor, T.ust, T.alt, T.lazer, T.prizma, T.fener, T.konik, T.top, T.masa, T.amp, T.kaynak, T.engel, T.perde, T.yari, T.tam, T.F1, T.F2, T.M1, T.M2];
      hepsi.forEach(o => o.visible = false); [...T.ray, ...T.sanal, ...T.spekt, T.eksen, T.normal].forEach(l => l.visible = false);
      const L = (l, a, b) => FZ.setLine(l, [a, b]);
      const tag = (id, txt, p, dx = 0, dy = 0) => { FZ.setTag(id, txt); FZ.show(id, p, 1, dx, dy); };
      const mumKoy = (m, x, h, ters) => { m.visible = true; m.position.set(x, ters ? Y0 : Y0 - 0.0, 0); m.scale.set(1, (ters ? -1 : 1) * Math.max(0.05, h), 1); };
      if (S.mod === 'ayna') {                              // düzlem ayna (gerekirse açılı iki ayna)
        T.ayna.visible = true; T.ayna.position.set(0, 0, 0); T.ayna.rotation.y = 0;
        mumKoy(T.cis, -S.d, 1); mumKoy(T.gor, S.d, 1); T.cis.position.y = 0; T.gor.position.y = 0;
        const C = V3(-S.d, 1.1, 0), E = V3(-S.d - 0.4, 1.1, 2.2), I = V3(S.d, 1.1, 0), t = (0 - E.x) / (I.x - E.x), M = E.clone().lerp(I, t);
        L(T.ray[0], C, M); L(T.ray[1], M, E); L(T.sanal[0], M, I); L(T.normal, M.clone().add(V3(-1.4, 0, 0)), M.clone().add(V3(0.5, 0, 0)));
        tag('opA', 'cisim', V3(-S.d, 2.6, 0)); tag('opB', 'görüntü', V3(S.d, 2.6, 0)); tag('opC', `${fs(S.d)} m`, V3(-S.d / 2, 0.2, 0)); tag('opE', `${fs(S.d)} m`, V3(S.d / 2, 0.2, 0));
        if (S.aci < 180) { T.ayna2.visible = true; T.ayna2.position.set(0, 0, -1.2); T.ayna2.rotation.y = Math.PI - S.aci * Math.PI / 180;
          tag('opD', `aynalar arası açı ${S.aci}°`, V3(0.6, 3.3, -1.2)); }
      } else if (S.mod === 'kure' || S.mod === 'mercek') {  // küresel ayna ya da ince mercek — ışınlar hesaplanır (yakın eksen yaklaşımı)
        const ayna = S.mod === 'kure', f = (S.tur === 'cukur' || S.tur === 'ince') ? S.f : -S.f, u = S.u, H = 1.25 * S.ho;   // H: mum + alev boyu
        (ayna ? (f > 0 ? T.cukur : T.tumsek) : (f > 0 ? T.ince : T.kalin)).visible = true;
        L(T.eksen, V3(-7, Y0, 0), V3(7, Y0, 0));
        const Fx = ayna ? -f : f, af = Math.abs(f);
        T.F1.visible = T.M1.visible = true;
        if (ayna) { T.F1.position.set(Fx, Y0, 0); T.M1.position.set(2 * Fx, Y0, 0); tag('opE', 'F', V3(Fx, Y0 - 0.45, 0)); tag('opF', 'M', V3(2 * Fx, Y0 - 0.45, 0)); }
        else { T.F2.visible = T.M2.visible = true; T.F1.position.set(-af, Y0, 0); T.F2.position.set(af, Y0, 0); T.M1.position.set(-2 * af, Y0, 0); T.M2.position.set(2 * af, Y0, 0);
          tag('opE', 'F', V3(-af, Y0 - 0.45, 0)); tag('opF', '2F', V3(-2 * af, Y0 - 0.45, 0)); }
        mumKoy(T.cis, -u, S.ho); T.cis.position.y = Y0; tag('opA', 'cisim', V3(-u, Y0 + H + 0.45, 0));
        const P = V3(-u, Y0 + H, 0), ileri = ayna ? -1 : 1, H1 = V3(0, Y0 + H, 0), V0 = V3(0, Y0, 0);
        L(T.ray[0], P, H1); L(T.ray[2], P, V0);                     // gelen ışınlar: eksene paralel ve tepe noktasına/merkeze giden
        if (S.cevap) {
          const sonsuz = Math.abs(u - f) < 1e-3, v = sonsuz ? Infinity : 1 / (1 / f - 1 / u), hi = sonsuz ? 0 : -H * v / u, gx = ayna ? -v : v;
          const d1 = V3(Fx, Y0, 0).sub(H1).normalize(); if (Math.sign(d1.x) !== ileri) d1.multiplyScalar(-1);   // 1. ışın odaktan geçer (ya da uzantısı odaktan)
          L(T.ray[1], H1, H1.clone().add(d1.clone().multiplyScalar(8)));
          const gel = V0.clone().sub(P).normalize(), d2 = ayna ? V3(-gel.x, gel.y, 0) : gel;   // aynada tepe noktasından eksene göre simetrik yansır; mercekte merkezden sapmadan geçer
          L(T.ray[3], V0, V0.clone().add(d2.clone().multiplyScalar(8)));
          if (!sonsuz) { const gercek = v > 0, G = V3(gx, Y0 + hi, 0); mumKoy(T.gor, gx, Math.abs(hi) / 1.25, hi < 0); T.gor.position.y = Y0;
            if (!gercek) { L(T.sanal[0], H1, G); L(T.sanal[1], V0, G); }
            const boy = Math.abs(hi / H);
            tag('opB', `görüntü: ${gercek ? 'gerçek' : 'sanal'}, ${hi < 0 ? 'ters' : 'düz'}, ${boy > 1.02 ? 'büyük' : boy < 0.98 ? 'küçük' : 'eşit boy'}`, V3(gx, Y0 + hi + (hi < 0 ? -0.5 : 0.5), 0)); }
          else tag('opB', 'görüntü oluşmaz (yansıyan ışınlar paralel)', V3(-2, Y0 + 2.6, 0)); }
      } else if (S.mod === 'kirilma') {
        T.ust.visible = T.alt.visible = true; T.lazer.visible = true;
        const i = S.i * Math.PI / 180, O = V3(0, Y0, 0), A = O.clone().add(V3(-Math.sin(i), Math.cos(i), 0).multiplyScalar(2.1));
        T.lazer.position.copy(A); T.lazer.rotation.z = -Math.PI / 2 + Math.atan2(O.y - A.y, O.x - A.x) + Math.PI / 2;
        L(T.ray[0], A, O); L(T.normal, V3(0, Y0 + 2, 0), V3(0, Y0 - 2, 0));
        const sr = S.n1 * Math.sin(i) / S.n2;
        if (!S.cevap) {} else if (sr <= 1) { const r = Math.asin(sr); L(T.ray[1], O, O.clone().add(V3(Math.sin(r), -Math.cos(r), 0).multiplyScalar(2.1))); tag('opB', `kırılma açısı ${Math.round(r * 180 / Math.PI)}°`, V3(1.3, Y0 - 1.4, 0)); }
        else { L(T.ray[1], O, O.clone().add(V3(Math.sin(i), Math.cos(i), 0).multiplyScalar(2.1))); tag('opB', 'tam yansıma', V3(1.4, Y0 + 1.4, 0)); }
        tag('opA', `gelme açısı ${S.i}°`, V3(-1.5, Y0 + 1.3, 0)); tag('opC', `n₁ = ${fs(S.n1)}`, V3(-3, Y0 + 1.8, 0)); tag('opD', `n₂ = ${fs(S.n2)}`, V3(-3, Y0 - 1.8, 0));
      } else if (S.mod === 'prizma') {
        T.prizma.visible = true; const giris = V3(-0.55, Y0 + 0.05, 0); L(T.ray[0], V3(-5, Y0 + 0.9, 0), giris);
        if (S.cevap) T.spekt.forEach((l, k) => { const c = V3(0.5, Y0 - 0.05 - k * 0.02, 0); FZ.setLine(l, [giris, c, c.clone().add(V3(4.5, -0.55 - k * 0.22, 0))]); });
        tag('opA', 'beyaz ışık', V3(-4, Y0 + 1.4, 0)); if (S.cevap) { tag('opD', 'kırmızı', V3(4.9, Y0 - 0.6, 0)); tag('opE', 'mor', V3(4.9, Y0 - 2.1, 0)); }
      } else if (S.mod === 'isik') {                       // renkli ışık altında cismin görünen rengi
        T.fener.visible = T.konik.visible = T.top.visible = T.masa.visible = true;
        T.fener.position.set(0, 3.6, 0); T.fener.rotation.z = -Math.PI / 2; T.konik.position.set(0, 2.15, 0);
        const ib = { k: [1, 0, 0], y: [0, 1, 0], m: [0, 0, 1], s: [1, 1, 0], b: [1, 1, 1], c: [0, 1, 1], g: [1, 0, 1] }, isk = ib[S.isik], cs = ib[S.cisim], son = isk.map((v, k) => v * cs[k]);
        T.konik.material.color.setRGB(...isk); T.top.material.color.setRGB(...(S.cevap ? son : cs).map(v => 0.05 + 0.95 * v)); T.top.position.set(0, 0.62, 0);
        const ad = { k: 'kırmızı', y: 'yeşil', m: 'mavi', s: 'sarı', b: 'beyaz', c: 'camgöbeği', g: 'magenta' };
        tag('opA', `ışık: ${ad[S.isik]}`, V3(1.4, 3.6, 0)); const adR = v => Object.keys(ib).find(k => ib[k].every((x, n) => x === v[n])); tag('opB', `beyaz ışıkta: ${ad[S.cisim]}`, V3(1.6, 1.3, 0)); tag('opC', S.cevap ? `görünen: ${adR(son) ? ad[adR(son)] : 'siyah'}` : 'görünen: ?', V3(1.6, 0.5, 0));
      } else if (S.mod === 'golge') {
        const xs = -4, xe = S.xe, xp = S.xp; T.perde.visible = true; T.perde.position.set(xp + 0.05, Y0, 0); T.engel.visible = true; T.engel.position.set(xe, Y0, 0); T.engel.scale.setScalar(S.r / 0.35);
        if (S.a > 0) { T.kaynak.visible = true; T.kaynak.position.set(xs, Y0, 0); T.kaynak.scale.setScalar(S.a / 0.4); } else { T.amp.visible = true; T.amp.position.set(xs, Y0 - 0.55, 0); T.amp.parla(1); }
        const k = (xp - xe) / (xe - xs), Rt = S.a > 0 ? S.r - (S.a - S.r) * k : S.r * (xp - xs) / (xe - xs), Ry = S.a > 0 ? S.r + (S.a + S.r) * k : 0;
        if (Rt > 0.01) { T.tam.visible = true; T.tam.position.set(xp, Y0, 0.0); T.tam.position.x = xp - 0.01; T.tam.scale.setScalar(Rt); }
        if (Ry > 0) { T.yari.visible = true; T.yari.position.set(xp - 0.005, Y0, 0); T.yari.scale.setScalar(Ry); }
        const kay = S.a > 0 ? S.a : 0;
        [[kay, S.r, Rt], [-kay, -S.r, -Rt]].forEach(([y1, y2], j) => L(T.ray[j], V3(xs, Y0 + y1, 0), V3(xp, Y0 + y1 + (y2 - y1) * (xp - xs) / (xe - xs), 0)));
        if (S.a > 0) [[S.a, -S.r], [-S.a, S.r]].forEach(([y1, y2], j) => L(T.ray[2 + j], V3(xs, Y0 + y1, 0), V3(xp, Y0 + y1 + (y2 - y1) * (xp - xs) / (xe - xs), 0)));
        tag('opA', S.a > 0 ? 'küresel kaynak' : 'noktasal kaynak', V3(xs, Y0 + 1.1, 0)); tag('opB', 'engel', V3(xe, Y0 + S.r + 0.5, 0)); tag('opC', 'perde', V3(xp, Y0 + 2.2, 0));
        if (S.olcu) tag('opD', S.olcu, V3(0.5, Y0 - 2, 1.2));
      } else if (S.mod === 'aydin') {
        T.masa.visible = true; T.masa.position.set(0, 0, 0); T.amp.visible = true; T.amp.position.set(0, S.h * 0.8 + 0.1, 0); T.amp.rotation.z = Math.PI; T.amp.position.y += 0.9; T.amp.parla(1);
        L(T.ray[0], V3(0, S.h * 0.8 + 0.4, 0), V3(0, 0.08, 0));
        tag('opA', `I = ${S.I} cd`, V3(1.3, S.h * 0.8 + 0.6, 0)); tag('opB', `d = ${fs(S.h)} m`, V3(0.9, S.h * 0.4, 0)); tag('opC', S.cevap ? `E = ${fs(S.I / S.h / S.h)} lx` : 'E = ?', V3(1.6, 0.3, 0));
      }
      if (S.mod !== 'aydin') T.amp.rotation.z = 0;
    },
    qp: () => V3(0, 4.2, 0) });

  const M = (S, mod, o) => Object.assign(S, { mod, ilk: 0, cevap: 0, olcu: '' }, o);
  const ALT = { aydin: 'Masanın üstünde lamba.', golge: 'Kaynak, engel (top) ve perde.', ayna: 'Düzlem ayna ve mum.', kure: 'Küresel ayna, asal eksen, F ve M noktaları.', mercek: 'Mercek, asal eksen ve odak noktaları.', kirilma: 'Lazer ışığı iki ortamın sınırına geliyor.', prizma: 'Beyaz ışık cam prizmaya geliyor.', isik: 'Karanlık odada fenerle renkli ışık.' };
  const st = (o, q) => ({ do: S => M(S, o.mod, o), sub: ALT[o.mod], q: Object.assign({ goster: S => { S.cevap = 1; } }, q) });

  // ======================= GÖREV A · Işık, gölge, aynalar =======================
  const gA = gorev(sOp, { yk: 'TYT10-g2', no: 2, icon: '🕯️', name: 'Kitap soruları: ışık, gölge, aynalar', task: 'Aydınlanma, ışık akısı, tam/yarı gölge, düzlem aynada açı ve görüntü sayısı, çukur ve tümsek ayna.', steps: [
    { do: S => M(S, 'aydin', { h: 2, I: 100, cevap: 1 }), sub: 'Optik laboratuvarı: lamba, ayna, mercek ve perdeler.', go: '▶︎ Başla' },
    st({ mod: 'aydin', h: 2, I: 100 }, { t: 'Masanın 2 m üstündeki lambanın ışık şiddeti 100 cd. Lambanın tam altındaki noktada aydınlanma kaç lüks olur?', o: ['25', '50', '200', '12,5', '75'], f: ['opA', 'opB', 'opC'],
      s: [`${FM(`E = ${F('I', 'd<sup>2</sup>')}`)} = ${F('100', '2<sup>2</sup>')} = <em>25 lx</em> ✓`], n: ['Aydınlanma uzaklığın KARESİYLE ters orantılıdır.', 'Birimler: ışık şiddeti kandela (cd), aydınlanma lüks (lx).'], goster: S => { S.cevap = 1; } }),
    st({ mod: 'aydin', h: 4, I: 100 }, { b: [`Aydınlanma: ${FM(`E = ${F('I', 'd<sup>2</sup>')}`)}`, 'Lamba aynı → ışık şiddeti I değişmez.'], t: 'Aynı lamba masadan 4 m yüksekliğe çıkarılırsa aydınlanma ilk değerin kaçta kaçı olur?', o: [`${F('1', '4')}`, `${F('1', '2')}`, `${F('1', '8')}`, 'Değişmez'], f: ['opB', 'opC'],
      s: ['Uzaklık 2 katına çıktı.', `E ∝ ${F('1', 'd<sup>2</sup>')} → ${F('1', '2<sup>2</sup>')} = <em>${F('1', '4')}</em> ✓`], n: ['Sık yanlış: "uzaklık 2 kat → aydınlanma yarı". Kare ilişkisi vardır.'], goster: S => { S.cevap = 1; } }),
    st({ mod: 'aydin', h: 2, I: 50 }, { t: 'Işık şiddeti 50 cd olan noktasal kaynağın her yöne yaydığı toplam ışık akısı kaç lümendir? (π = 3)', o: ['600', '200', '150', '50', '1200'],
      s: [`${FM('Φ = 4 π I')} = 4 · 3 · 50 = <em>600 lm</em> ✓`], n: ['Işık akısı, kaynağın bütün çevresine (4π katı açıya) yaydığı ışık miktarıdır.', 'Akı uzaklığa bağlı değildir; aydınlanma uzaklığa bağlıdır.'] }),
    st({ mod: 'aydin', h: 2, I: 40 }, { t: 'Fotometrede yağ lekesi 40 cd\'lik kaynaktan 2 m, ikinci kaynaktan 3 m uzakta iken iki yüzü eşit aydınlanıyor. İkinci kaynağın şiddeti kaç cd\'dir?', o: ['90', '60', '27', '120', '180'],
      s: ['Eşit aydınlanma: ' + FM(`${F('I<sub>1</sub>', 'd<sub>1</sub><sup>2</sup>')} = ${F('I<sub>2</sub>', 'd<sub>2</sub><sup>2</sup>')}`), `${F('40', '4')} = ${F('I<sub>2</sub>', '9')} → I<sub>2</sub> = <em>90 cd</em> ✓`], n: ['Yağ lekesi iki yüzü eşit aydınlanınca görünmez olur.'] }),
    st({ mod: 'golge', a: 0, r: 0.35, xe: -2, xp: 4, olcu: 'kaynak–engel 2 m · kaynak–perde 8 m' }, { t: 'Noktasal kaynaktan 2 m uzaktaki 10 cm yarıçaplı top, kaynaktan 8 m uzaktaki perdeye gölge düşürüyor. Tam gölgenin yarıçapı kaç cm\'dir?', o: ['40', '20', '80', '10', '120'], f: ['opD'],
      s: ['Benzer üçgenler: ' + FM(`${F('R', 'r')} = ${F('kaynak–perde', 'kaynak–engel')}`), `R = 10 · ${F('8', '2')} = <em>40 cm</em> ✓`], n: ['Noktasal kaynakta yalnız tam gölge oluşur, yarı gölge oluşmaz.', 'Işık doğrusal yayıldığı için gölge kenarları kaynaktan engelin kenarına çizilen doğrularla bulunur.'] }),
    st({ mod: 'golge', a: 0.4, r: 0.35, xe: -1, xp: 4.5 }, { t: 'Noktasal kaynak yerine aynı yerde küresel (geniş) bir kaynak konursa perdede ne görülür?', o: ['Ortada tam gölge, çevresinde yarı gölge', 'Yalnız tam gölge', 'Yalnız yarı gölge, her zaman', 'Gölge oluşmaz'], f: ['opA'],
      s: ['Kaynağın bazı noktalarından gelen ışık engelin kenarından geçer: bu bölgeler kısmen aydınlık → <em>yarı gölge</em>.', 'Hiçbir noktadan ışık almayan orta bölge <em>tam gölge</em> ✓'], n: ['Kaynak engelden büyükse ve perde yeterince uzaksa tam gölge kaybolabilir; yalnız yarı gölge kalır.'] }),
    st({ mod: 'golge', a: 0.55, r: 0.35, xe: -1, xp: 4.5 }, { t: 'Küresel kaynağın yarıçapı artırılırsa (diğerleri aynı) tam gölge ve yarı gölge nasıl değişir?', o: ['Tam gölge küçülür, yarı gölge büyür', 'İkisi de büyür', 'Tam gölge büyür, yarı gölge küçülür', 'İkisi de değişmez'],
      s: ['Kaynağın kenarları daha geniş açıdan ışık gönderir: tam gölgeyi daraltan ışınlar içeri girer → tam gölge küçülür.', 'Yarı gölgenin dış sınırı genişler → <em>yarı gölge büyür</em> ✓'], n: ['Gölge sorularında kaynağın iki kenarından engelin iki kenarına çapraz ve düz doğrular çizilir.'] }),
    st({ mod: 'golge', a: 0.4, r: 0.35, xe: -1, xp: 4.5 }, { t: 'Güneş tutulmasında Güneş, Ay ve Dünya nasıl sıralanır?', o: ['Güneş – Ay – Dünya', 'Güneş – Dünya – Ay', 'Ay – Güneş – Dünya', 'Sıralama önemli değil'],
      s: ['Güneş kaynak, <em>Ay engel</em>, Dünya perdedir: Ay\'ın gölgesi Dünya\'ya düşer ✓', 'Tam gölgedeki bölgede tam tutulma, yarı gölgedeki bölgede parçalı tutulma görülür.'], n: ['Ay tutulmasında ise Dünya arada kalır: Güneş – Dünya – Ay.'] }),
    st({ mod: 'ayna', d: 2.5, aci: 180 }, { t: 'Bir ışın düzlem aynaya gelme açısı 35° olacak biçimde geliyor. Ayna 15° döndürülürse yansıyan ışın kaç derece döner?', o: ['30°', '15°', '35°', '70°', '60°'],
      s: ['Ayna θ kadar dönünce normal de θ döner; gelme açısı θ değişir, yansıma açısı da θ değişir.', 'Yansıyan ışın 2θ döner: 2 · 15 = <em>30°</em> ✓'], n: ['Gelme açısının (35°) değeri sonuca etki etmez; bu sayı çeldiricidir.'] }),
    st({ mod: 'ayna', d: 2, aci: 60 }, { t: 'Aralarındaki açı 60° olan iki düzlem aynanın arasına konan bir cismin kaç görüntüsü oluşur?', o: ['5', '6', '3', '2', '10'], f: ['opD'],
      s: [FM(`N = ${F('360°', 'α')} − 1`) + ` = ${F('360', '60')} − 1 = <em>5</em> ✓`], n: ['Paralel aynalarda (α = 0) sonsuz görüntü oluşur.', 'Formül, 360/α tam sayı olduğunda geçerlidir.'] }),
    st({ mod: 'ayna', d: 1.5, aci: 180 }, { t: 'Boyu 170 cm olan biri düzlem aynada kendini baştan ayağa görebilmek için en az kaç cm boyunda ayna kullanmalıdır?', o: ['85', '170', '340', '42,5', '255'],
      s: ['Ayaktan ve baştan gelen ışınlar göze ulaşmak için aynada, boyun yarısı kadarlık bir bölgede yansır.', 'Ayna boyu = 170 / 2 = <em>85 cm</em> ✓'], n: ['Gereken ayna boyu, kişinin aynaya uzaklığına bağlı değildir.'] }),
    st({ mod: 'kure', tur: 'cukur', f: 1, u: 3, ho: 0.9 }, { t: 'Odak uzaklığı 10 cm olan çukur aynanın önüne, aynadan 30 cm uzağa bir mum konuyor. Görüntü aynadan kaç cm uzakta oluşur?', o: ['15', '20', '30', '7,5', '45'], f: ['opB', 'opE', 'opF'],
      s: ['1. YOL: ' + FM(`${F('1', 'f')} = ${F('1', 'u')} + ${F('1', 'v')}`) + ` → ${F('1', 'v')} = ${F('1', '10')} − ${F('1', '30')} = ${F('2', '30')} → v = <em>15 cm</em> ✓`, '§2. YOL: cisim M\'nin dışında (u > 2f = 20 cm) → görüntü F ile M arasında: 10 < v < 20; yalnız 15 cm uyar.'], n: ['Çukur aynada asal eksene paralel gelen ışın odaktan geçerek yansır; merkezden (M) geçen ışın kendi üzerinden geri döner.', 'Görüntü gerçek, ters ve küçüktür.'] }),
    st({ mod: 'kure', tur: 'cukur', f: 1.6, u: 1, ho: 0.6 }, { t: 'Çukur aynada mum, odak ile ayna arasına konuyor. Görüntünün özellikleri nedir?', o: ['Sanal, düz, büyük', 'Gerçek, ters, küçük', 'Gerçek, ters, büyük', 'Görüntü oluşmaz'], f: ['opB'],
      s: ['Yansıyan ışınlar ayrılır; uzantıları aynanın arkasında kesişir → <em>sanal</em>.', 'Görüntü <em>düz ve büyük</em> ✓ (makyaj/tıraş aynası).'], n: ['Gri kesikli çizgiler ışınların uzantılarıdır; sanal görüntü perdeye düşürülemez.'] }),
    st({ mod: 'kure', tur: 'tumsek', f: 1.5, u: 3, ho: 1 }, { t: 'Araçlardaki dikiz aynası gibi tümsek aynada cisim nereye konursa konsun görüntü nasıldır?', o: ['Sanal, düz, küçük', 'Gerçek, ters, küçük', 'Sanal, düz, büyük', 'Gerçek, düz, eşit boy'], f: ['opB'],
      s: ['Tümsek ayna ışınları dağıtır; uzantılar aynanın arkasında, odak ile ayna arasında kesişir.', 'Görüntü her zaman <em>sanal, düz, küçük</em> ✓; görüş alanı geniştir.'], n: ['Tümsek aynada odak aynanın arkasındadır (f negatif alınır).'] }),
    st({ mod: 'kure', tur: 'cukur', f: 1.2, u: 2.4, ho: 0.9 }, { t: 'Çukur aynada cisim merkez noktasına (M) konursa görüntü nerede oluşur?', o: ['M\'de, ters ve eşit boyda', 'F\'de, nokta biçiminde', 'Aynanın arkasında, düz', 'Sonsuzda'],
      s: ['u = 2f → v = 2f: görüntü de M\'de oluşur.', 'Büyütme v/u = 1 → <em>ters ve eşit boy</em> ✓'], n: ['M noktası eğrilik merkezidir; odak uzaklığı f = r/2.'] }),
  ] });

  // ======================= GÖREV B · Kırılma, renkler, mercekler =======================
  const gB = gorev(sOp, { yk: 'TYT10-g3', no: 3, icon: '🔍', name: 'Kitap soruları: kırılma, renk, mercek', task: 'Snell yasası, sınır açısı ve tam yansıma, görünür derinlik, renk ayrışması, renkli ışıkta cisim rengi, mercekte görüntü, göz kusurları.', steps: [
    { do: S => M(S, 'kirilma', { n1: 1, n2: 1.73, i: 60 }), sub: 'Optik laboratuvarı: lazer, prizma, renkli ışıklar ve mercekler.', go: '▶︎ Başla' },
    st({ mod: 'kirilma', n1: 1, n2: 1.73, i: 60 }, { t: 'Işık havadan (n = 1) kırıcılık indisi √3 olan cama 60° gelme açısıyla giriyor. Kırılma açısı kaç derecedir?', o: ['30°', '45°', '60°', '20°', '15°'], f: ['opA', 'opB'], gizle: ['opB'],
      s: [FM('n<sub>1</sub> sin i = n<sub>2</sub> sin r') + ` → 1 · ${F('√3', '2')} = √3 · sin r`, `sin r = ${F('1', '2')} → r = <em>30°</em> ✓`], n: ['Az kırıcıdan çok kırıcıya geçen ışık normale yaklaşır (r < i).', 'Açılar her zaman normalle ölçülür.'] }),
    st({ mod: 'kirilma', n1: 2, n2: 1, i: 45 }, { t: 'Kırıcılık indisi 2 olan bir ortamdan havaya 45° ile gelen ışığa ne olur?', o: ['Tam yansımaya uğrar', 'Normale yaklaşarak kırılır', 'Kırılmadan geçer', 'Yüzeyi yalayarak geçer'], f: ['opA', 'opC', 'opD'], gizle: ['opB'],
      s: ['Sınır açısı: ' + FM(`sin θ<sub>s</sub> = ${F('n<sub>2</sub>', 'n<sub>1</sub>')}`) + ` = ${F('1', '2')} → θ<sub>s</sub> = 30°`, '45° > 30° → <em>tam yansıma</em> ✓'], n: ['Tam yansıma yalnız çok kırıcıdan az kırıcıya geçişte ve gelme açısı sınır açısından büyükse olur.', 'Fiber optik kablolar bu ilkeyle çalışır.'] }),
    st({ mod: 'kirilma', n1: 1.33, n2: 1, i: 20 }, { t: 'Derinliği 2 m olan havuzun dibine dik yukarıdan bakan kişi dibi kaç m derinde görür? (n<sub>su</sub> = 4/3)', o: ['1,5', '2', '2,67', '1', '3'],
      s: [FM(`h<sub>görünen</sub> = h · ${F('n<sub>göz</sub>', 'n<sub>cisim</sub>')}`) + ` = 2 · ${F('1', '4/3')} = <em>1,5 m</em> ✓`], n: ['Sudan havaya çıkan ışık normalden uzaklaşır; göz ışığı geldiği doğrultuda geri uzatır → dip olduğundan sığ görünür.'] }),
    st({ mod: 'kirilma', n1: 1.33, n2: 1, i: 30 }, { t: 'Işık sudan havaya geçtiğinde aşağıdakilerden hangisi değişmez?', o: ['Frekansı', 'Hızı', 'Dalga boyu', 'Yayılma doğrultusu (eğik gelişte)'],
      s: ['Frekansı kaynak belirler: ortam değişince <em>frekans değişmez</em> ✓', 'Havada hız artar, v = λ · f olduğundan dalga boyu da artar.'], n: ['Işığın rengi frekansına bağlıdır; bu yüzden su içinde de renk aynı görünür.'] }),
    { do: S => M(S, 'prizma', {}), sub: ALT.prizma, q: { goster: S => { S.cevap = 1; }, t: 'Beyaz ışık cam prizmadan geçerken renklerine ayrılıyor. En az sapan renk hangisidir?', o: ['Kırmızı', 'Mor', 'Yeşil', 'Mavi'], f: ['opD', 'opE'], gizle: ['opD', 'opE'],
      s: ['Camın kırıcılık indisi kırmızı için en küçük, mor için en büyüktür.', 'İndis küçük → az sapma: <em>kırmızı</em> ✓'], n: ['Gökkuşağı yağmur damlalarındaki bu ayrışmadır (dispersiyon).'] } },
    st({ mod: 'isik', isik: 'm', cisim: 'k' }, { t: 'Beyaz ışıkta kırmızı görünen top karanlık odada yalnız mavi ışıkla aydınlatılırsa hangi renkte görünür?', o: ['Siyah', 'Kırmızı', 'Mavi', 'Mor'], f: ['opA', 'opB'],
      s: ['Kırmızı cisim yalnız kırmızı ışığı yansıtır, diğer renkleri soğurur.', 'Mavi ışığı soğurur, yansıtacak ışık yok → <em>siyah</em> ✓'], n: ['Cismin rengi, yansıttığı ışığın rengidir.'] }),
    st({ mod: 'isik', isik: 'k', cisim: 's' }, { t: 'Beyaz ışıkta sarı görünen top yalnız kırmızı ışıkla aydınlatılırsa hangi renkte görünür?', o: ['Kırmızı', 'Sarı', 'Siyah', 'Yeşil'], f: ['opA', 'opB'],
      s: ['Sarı cisim sarıyı oluşturan kırmızı ve yeşil ışığı yansıtır.', 'Gelen kırmızı ışığı yansıtır → <em>kırmızı</em> ✓'], n: ['Işık renklerinde: kırmızı + yeşil = sarı, kırmızı + mavi = magenta, yeşil + mavi = camgöbeği, üçü = beyaz.'] }),
    st({ mod: 'isik', isik: 's', cisim: 'b' }, { t: 'Kırmızı ve yeşil ışık beyaz perdede üst üste düşürülürse perde hangi renkte görünür?', o: ['Sarı', 'Kahverengi', 'Beyaz', 'Mavi'],
      s: ['Işık renkleri toplanır: kırmızı + yeşil = <em>sarı</em> ✓'], n: ['Boyaların karışımı farklıdır: boyalar ışığı soğurarak renk verir (çıkarmalı karışım).'] }),
    st({ mod: 'mercek', tur: 'ince', f: 1.2, u: 3.6, ho: 0.9 }, { t: 'Odak uzaklığı 20 cm olan ince kenarlı merceğin önüne, mercekten 60 cm uzağa mum konuyor. Görüntü mercekten kaç cm uzakta oluşur?', o: ['30', '40', '60', '15', '90'], f: ['opB'],
      s: ['1. YOL: ' + FM(`${F('1', 'f')} = ${F('1', 'u')} + ${F('1', 'v')}`) + ` → ${F('1', 'v')} = ${F('1', '20')} − ${F('1', '60')} = ${F('2', '60')} → v = <em>30 cm</em> ✓`, '§2. YOL: cisim 2F\'nin dışında (60 > 40) → görüntü F ile 2F arasında: 20 < v < 40; seçeneklerde yalnız 30 cm.'], n: ['İnce kenarlı (yakınsak) mercekte paralel gelen ışın kırılıp öbür taraftaki odaktan geçer; merkezden geçen ışın sapmaz.', 'Görüntü gerçek, ters ve küçük.'] }),
    st({ mod: 'mercek', tur: 'ince', f: 1.6, u: 0.9, ho: 0.5 }, { b: ['İnce kenarlı mercekte cismin odağa göre yeri görüntüyü belirler: odağın dışında gerçek–ters, odak ile mercek arasında ışınlar ayrılır.', 'Ayrılan ışınların uzantılarının kesiştiği yerde sanal görüntü oluşur.'], t: 'Büyüteçle bir böceğe bakarken böcek merceğin odak noktası ile mercek arasındadır. Görülen görüntü nasıldır?', o: ['Sanal, düz, büyük', 'Gerçek, ters, büyük', 'Gerçek, düz, küçük', 'Sanal, ters, küçük'], f: ['opB'],
      s: ['Kırılan ışınlar ayrılır; uzantıları cismin olduğu tarafta kesişir → <em>sanal</em>.', 'Görüntü <em>düz ve büyük</em> ✓: büyüteç böyle çalışır.'] }),
    st({ mod: 'mercek', tur: 'kalin', f: 1.5, u: 3, ho: 1 }, { t: 'Uzağı net göremeyen (miyop) bir göz için hangi tür mercekli gözlük kullanılır?', o: ['Kalın kenarlı (ıraksak)', 'İnce kenarlı (yakınsak)', 'Düz cam', 'Tümsek ayna'],
      s: ['Miyop gözde görüntü retinanın önünde oluşur; ışınları biraz dağıtmak gerekir.', 'Işınları dağıtan <em>kalın kenarlı (ıraksak)</em> mercek ✓'], n: ['Hipermetrop gözde görüntü retinanın arkasında oluşur → ince kenarlı (yakınsak) mercek kullanılır.', 'Kalın kenarlı mercekte görüntü her zaman sanal, düz, küçüktür.'] }),
    st({ mod: 'mercek', tur: 'ince', f: 1.5, u: 3, ho: 0.8 }, { t: 'Havada odak uzaklığı f olan cam mercek suyun içine konursa odak uzaklığı ne olur?', o: ['Artar', 'Azalır', 'Değişmez', 'Sıfır olur', 'Önce artar, sonra azalır'],
      s: ['Merceğin ışığı kırma gücü, mercek ile ortamın kırıcılık farkına bağlıdır.', 'Suyun indisi havadan büyük → fark azalır → kırma azalır → <em>f artar</em> ✓'], n: ['Mercek ortamla aynı indisteyse ışığı hiç kırmaz (görünmez olur).'] }),
    st({ mod: 'mercek', tur: 'ince', f: 1.2, u: 2.4, ho: 0.8 }, { b: [`Mercek denklemi: ${FM(`${F('1', 'f')} = ${F('1', 'u')} + ${F('1', 'v')}`)}`, `Büyütme: ${FM(`${F('h<sub>g</sub>', 'h<sub>c</sub>')} = ${F('v', 'u')}`)}`], t: 'İnce kenarlı merceğin 2F noktasına konan cismin görüntüsü nasıldır?', o: ['Öbür taraftaki 2F\'de, gerçek, ters, eşit boy', 'Odakta, nokta biçiminde', 'Aynı tarafta, sanal, büyük', 'Sonsuzda'],
      s: ['u = 2f → v = 2f; büyütme v/u = 1.', 'Görüntü <em>2F\'de, gerçek, ters, eşit boy</em> ✓'] }),
  ] });

  // ======================= TUZAK SORULAR =======================
  const gT = gorev(sOp, { yk: 'TYT10-g4', no: 4, icon: '🪤', name: 'Tuzak sorular: optik', tuzak: true, task: 'Sık yapılan hatalar: ayna hızı, yarısı kapatılan mercek, görüntüyü görmek için ayna boyu, renk.', steps: [
    { do: S => M(S, 'ayna', { d: 2, aci: 180 }), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    st({ mod: 'ayna', d: 2, aci: 180 }, { b: ['Düzlem aynada cisim ve görüntünün aynaya uzaklıkları her an eşittir.', 'Cisim–görüntü uzaklığı = 2 · (cisim–ayna uzaklığı)'], t: 'Düzlem aynaya 1 m/s hızla dik yaklaşan çocuk, görüntüsüne kaç m/s hızla yaklaşır?', o: ['2', '1', '0', '0,5', '4'],
      s: ['Çocuk 1 s\'de aynaya 1 m yaklaşırsa görüntü de aynaya 1 m yaklaşır.', 'Aralarındaki uzaklık 2 m azalır → <em>2 m/s</em> ✓'], n: ['TUZAK: "görüntü de 1 m/s" demek. Soru, çocuğun görüntüye GÖRE hızını soruyor.'] }),
    st({ mod: 'mercek', tur: 'ince', f: 1.2, u: 3.6, ho: 0.9 }, { b: ['Cismin her noktasından çıkan ışınlar merceğin bütün yüzeyine dağılır.', 'Görüntünün parlaklığı merceğe giren ışık miktarına bağlıdır.'], t: 'Gerçek görüntü veren ince kenarlı merceğin üst yarısı siyah kartonla kapatılırsa ne olur?', o: ['Görüntünün tamamı oluşur, daha sönük olur', 'Görüntünün yarısı kaybolur', 'Görüntü oluşmaz', 'Görüntü büyür'],
      s: ['Cismin her noktasından çıkan ışınlar merceğin her yerinden geçer; alt yarıdan geçenler de bütün görüntüyü oluşturur.', 'Daha az ışık geçer → <em>tam ama sönük görüntü</em> ✓'], n: ['TUZAK: "yarısı kapandı, görüntünün yarısı gider" sanmak.'] }),
    st({ mod: 'ayna', d: 3, aci: 180 }, { b: ['Kendini tam görmek için gereken en kısa ayna boyu, boyunun yarısıdır.', 'Düzlem aynada görüntü boyu cisim boyuna eşittir.'], t: 'Aynada kendini tam göremeyen kişi aynadan uzaklaşırsa ne olur?', o: ['Yine tam göremez; gereken ayna boyu uzaklığa bağlı değildir', 'Tamamını görür', 'Daha az kısmını görür', 'Görüntüsü küçülür, tamamını görür'],
      s: ['Gereken ayna boyu boyun yarısıdır ve aynaya uzaklıkla değişmez.', '→ <em>yine tam göremez</em> ✓'], n: ['TUZAK: uzaklaşınca görüntünün küçüleceğini sanmak. Düzlem aynada görüntü boyu cisimle aynıdır; yalnız görme açısı küçülür.'] }),
    st({ mod: 'isik', isik: 'y', cisim: 'b' }, { b: ['Bir cismin rengi, üzerine gelen ışıktan yansıttığı renklerdir.', 'Beyaz cisim bütün renkleri yansıtır; siyah cisim hepsini soğurur.'], t: 'Beyaz ışıkta beyaz görünen bir kâğıt yalnız yeşil ışıkla aydınlatılırsa hangi renkte görünür?', o: ['Yeşil', 'Beyaz', 'Siyah', 'Sarı'],
      s: ['Beyaz cisim bütün renkleri yansıtır; gelen yalnız yeşil olduğu için yansıyan da yeşildir → <em>yeşil</em> ✓'], n: ['TUZAK: "beyaz cisim hep beyaz görünür". Cisim yalnız ÜZERİNE GELEN ışığı yansıtabilir.'] }),
  ] });

  FZ.konuEk('TYT', 'Optik', { gorevler: [gA, gB, gT] });
})();
