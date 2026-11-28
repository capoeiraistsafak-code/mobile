// AYT 17 · Dönme ve Açısal Momentum — AYT 18 · Kütle Çekim ve Kepler Yasaları — AYT 19 · Basit Harmonik Hareket
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');

  // =====================================================================
  // AYT 17 · DÖNME VE AÇISAL MOMENTUM — kolları açılıp kapanan dönen platform
  // I = I₀ + 2 m r² (I₀ = 2 kg·m², m = 2 kg)
  // =====================================================================
  const I17 = r => 2 + 2 * 2 * r * r;
  const s17 = sahne({ icon: '⛸️', cam: [[1.2, 5, 9], [1.2, 1.2, 0]], plate: [8, 8, 0, 0],
    data: [['Platform + kişi', 'I₀ = 2 kg·m²'], ['Her top', 'm = 2 kg']],
    S0: () => ({ r: 1, hedef: 1, L: 12, ac: 0 }),
    kur(g) {
      silindir(g, 1.4, 1.5, 0.25, 0x94a3b8, 0, 0.13, 0);
      const don = new THREE.Group(); don.position.y = 0.25; g.add(don);
      const ins = FZ.insan(don, 0x7c3aed, 0.95); ins.rotation.y = -Math.PI / 2;   // dönen platformdaki kişi (kolları yanlara açık)
      const kol = new THREE.Group(); don.add(kol);
      const t1 = FZ.dambil(don), t2 = FZ.dambil(don); t1.position.set(1, 1.3, 0); t2.position.set(-1, 1.3, 0);
      kart('d17t', '', '#F5C400'); etiket('d17v', 'v', '#16a34a');
      return { don, kol, ins, t1, t2, ov: ok(0x22c55e, 'd17v') };
    },
    tick(S, dt, o) {
      S.r += (S.hedef - S.r) * Math.min(1, dt * 1.5);
      const I = I17(S.r), w = S.L / I; S.ac += w * dt; o.don.rotation.y = S.ac;
      o.t1.position.x = S.r * 1.2; o.t2.position.x = -S.r * 1.2; o.don.updateMatrixWorld(true); FZ.koluUzat(o.ins, 0, o.t1.getWorldPosition(V3())); FZ.koluUzat(o.ins, 1, o.t2.getWorldPosition(V3()));
      const p = o.t1.getWorldPosition(V3()), tg = V3(-Math.sin(S.ac), 0, -Math.cos(S.ac)); // teğet (dönme yönünde)
      FZ.setArrow(o.ov, p, tg, w * S.r * 0.45); FZ.show('d17v', p.clone().add(tg.clone().multiplyScalar(w * S.r * 0.45 + 0.3)), 1);
      FZ.setTag('d17t', `r = ${fs(S.r)} m · I = ${fs(I)} kg·m² · ω = ${fs(w)} rad/s<br>L = Iω = ${fs(S.L)} · E<sub>k</sub> = ${fs(0.5 * I * w * w)} J`); FZ.show('d17t', V3(0, 3.4, 0), 1);
    },
    qp: () => V3(0, 4.1, 0) });
  const d17 = ders(s17, { yk: 'AYT17-d1', no: 1, icon: '⛸️', name: 'Buz patencisi neden hızlanır?', task: 'Eylemsizlik momenti, açısal momentum, açısal momentumun korunumu, dönme kinetik enerjisi.', steps: [
    { k: { tur: 'merak', b: 'Patenci kollarını kapatınca kimse itmediği hâlde neden hızla döner?', m: ['Dönmede "kütle" yerine eylemsizlik momenti, "momentum" yerine açısal momentum vardır.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Eylemsizlik momenti ve açısal momentum', m: [`${FM('I = Σ m r<sup>2</sup>')} · kütle eksenden uzaklaştıkça döndürmek zorlaşır.`, `${FM('L = I ω')} · noktasal cisim için ${FM('L = m v r')}`] } },
    { p: { t: 'Kişi kollarındaki topları 1 m\'den 0,5 m\'ye çekerse dönme hızı ne olur? (sürtünme yok)', o: ['Azalır', 'Değişmez', 'Artar', 'Durur'], d: 2 } },
    { sub: 'Kolları kapatalım.', go: '▶︎ Kolları kapat' },
    { do: S => { S.hedef = 0.5; }, sub: 'Toplar eksene yaklaşıyor…', wait: 3 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Dış tork yoksa L korunur', f: ['d17t'], m: ['I: 2 + 4 · 1² = 6 → 2 + 4 · 0,5² = 3 kg·m² (yarıya indi)', `${FM('I<sub>1</sub> ω<sub>1</sub> = I<sub>2</sub> ω<sub>2</sub>')} → 6 · 2 = 3 · ω<sub>2</sub> → ω<sub>2</sub> = 4 rad/s`] } },
    { k: { tur: 'kavram', b: 'Tork ve açısal momentum', m: [`${FM(`τ = ${F('ΔL', 'Δt')}`)} · dış tork yoksa ΔL = 0.`, `Dönme kinetik enerjisi: ${FM(`E<sub>k</sub> = ${F('1', '2')} I ω<sup>2</sup>`)}`] } },
    { x: { b: 'Topların uzaklığını değiştir', m: ['L = 12 kg·m²/s sabit.'],
      kay: [{ ad: 'r', etiket: 'r', min: 0.25, max: 1.5, adim: 0.25, deger: 0.5, birim: 'm', set: (S, v) => { S.hedef = v; } }],
      olc: S => { const I = I17(S._r); return `I = <em>${fs(I)} kg·m²</em> · ω = ${F('12', fs(I))} = <em>${fs(12 / I)} rad/s</em>`; } } },
    { do: S => { S.hedef = 0.5; }, k: { tur: 'dikkat', b: 'L korunur ama E<sub>k</sub> korunmaz', m: ['Kollar kapanınca E<sub>k</sub> = ½ · 6 · 2² = 12 J → ½ · 3 · 4² = 24 J oldu!', 'Fazla enerjiyi kişinin kasları sağlar: topları içeri çekerken iş yapar.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('I = Σ m r<sup>2</sup>')} · ${FM('L = I ω')} · ${FM(`τ = ${F('ΔL', 'Δt')}`)} · ${FM(`E<sub>k</sub> = ${F('1', '2')} I ω<sup>2</sup>`)}`, 'Dış tork yoksa L korunur: I küçülürse ω büyür.'] } },
  ] });
  const g17 = gorev(s17, { yk: 'AYT17-g1', no: 1, icon: '🌀', name: 'Dönen platform', task: 'Eylemsizlik momenti, açısal momentum ve korunumunu kullanın.', steps: [
    { do: S => { S.hedef = 1; S.r = 1; S.L = 12; }, sub: 'Platform sabit eksen etrafında dönüyor.', go: '▶︎ Başlat' },
    { q: { t: 'Kütlesiz çubuğun iki ucunda, eksenden 2 m uzakta 3\'er kg\'lık noktasal kütleler var. Sistemin eylemsizlik momenti kaç kg·m²\'dir?', o: ['24 kg·m²', '12 kg·m²', '6 kg·m²', '48 kg·m²', '72 kg·m²'],
      s: [`${FM('I = Σ m r<sup>2</sup>')} = 3 · 2² + 3 · 2² = <em>24 kg·m²</em> ✓`], n: ['Uzaklığın karesi girdiği için kütlenin eksene uzaklığı çok önemlidir.'] } },
    { q: { t: '2 kg\'lık cisim 4 m yarıçaplı çembersel yörüngede 3 m/s hızla dönüyor. Açısal momentumu kaç kg·m²/s\'dir?', o: ['24', '6', '12', '96', '48'],
      s: ['§1. YOL · L = mvr', 'L = 2 · 3 · 4 = <em>24 kg·m²/s</em> ✓', '§2. YOL · L = Iω', `I = 2 · 16 = 32 · ω = ${F('3', '4')} → L = 32 · ${F('3', '4')} = <em>24</em> ✓`], n: ['Noktasal cisimde iki yol aynı sonucu verir.'] } },
    { do: S => { S.hedef = 0.5; }, q: { t: 'Eylemsizlik momenti 8 kg·m² olan sistem 3 rad/s ile dönüyor. Dış tork olmadan I = 4 kg·m²\'ye düşerse açısal hız kaç rad/s olur?', o: ['6 rad/s', '1,5 rad/s', '3 rad/s', '12 rad/s', '18 rad/s'], f: ['d17t'],
      s: [`${FM('I<sub>1</sub> ω<sub>1</sub> = I<sub>2</sub> ω<sub>2</sub>')} → 8 · 3 = 4 · ω<sub>2</sub> → <em>ω<sub>2</sub> = 6 rad/s</em> ✓`], n: ['I yarıya inince ω iki katına çıkar.'] } },
    { q: { t: 'Aynı olayda dönme kinetik enerjisi nasıl değişir?', o: ['36 J\'den 72 J\'ye çıkar', 'Değişmez (36 J)', '36 J\'den 18 J\'ye iner', '36 J\'den 144 J\'ye çıkar'],
      s: [`E<sub>1</sub> = ${F('1', '2')} · 8 · 3² = 36 J`, `E<sub>2</sub> = ${F('1', '2')} · 4 · 6² = <em>72 J</em> ✓`], n: ['Açısal momentum korunur, kinetik enerji korunmaz; fark iç kuvvetlerin işinden gelir.'] } },
  ] });
  konuEkle('AYT', 'Dönme ve Açısal Momentum', { dersler: [d17], gorevler: [g17] });

  // =====================================================================
  // AYT 18 · KÜTLE ÇEKİM VE KEPLER — eliptik yörüngede gezegen (Güneş odakta)
  // =====================================================================
  const E18 = 0.4;
  const s18 = sahne({ icon: '🪐', cam: [[-0.5, 13, 6], [-0.5, 0, 0.3]], plate: [14, 11, -1.5, 0],
    data: [['G', '6,67 · 10⁻¹¹ N·m²/kg²']],
    S0: () => ({ aAU: 3, M: 0, alan: 0, iz: [] }),
    kur(g) {
      const gunes = top(g, 0.45, 0xfbbf24, 0, 0.5, 0), gez = top(g, 0.2, 0x3b82f6, 2, 0.5, 0);
      const yorunge = FZ.cizgi(g, 0x64748b);
      const N = 24, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 9), 3));
      const fan = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.45, side: THREE.DoubleSide })); g.add(fan);
      etiket('k18F', 'F', '#dc2626'); etiket('k18v', 'v', '#16a34a'); kart('k18t', '', '#F5C400'); kart('k18s', 'Güneş', '#ca8a04');
      return { gunes, gez, yorunge, fan, N, oF: ok(0xef4444, 'k18F'), ov: ok(0x22c55e, 'k18v') };
    },
    tick(S, dt, o) {
      const a = 1.2 * S.aAU, b = a * Math.sqrt(1 - E18 * E18), T = 6 * Math.pow(S.aAU / 3, 1.5), n = 2 * Math.PI / T;
      S.M += n * dt;
      const kep = M => { let E = M; for (let i = 0; i < 8; i++) E = E - (E - E18 * Math.sin(E) - M) / (1 - E18 * Math.cos(E)); return E; };
      const pos = E => V3(a * (Math.cos(E) - E18), 0.5, -b * Math.sin(E));
      const pts = []; for (let i = 0; i <= 80; i++) pts.push(pos(i / 80 * Math.PI * 2).setY(0.05)); FZ.setLine(o.yorunge, pts);
      const E = kep(S.M), p = pos(E); o.gez.position.copy(p);
      const r = Math.hypot(p.x, p.z), dEdt = n / (1 - E18 * Math.cos(E)), vel = V3(-a * Math.sin(E) * dEdt, 0, -b * Math.cos(E) * dEdt), sp = vel.length();
      FZ.setArrow(o.ov, p, vel, sp * 0.35); FZ.show('k18v', p.clone().add(vel.clone().normalize().multiplyScalar(sp * 0.35 + 0.35)), 1);
      const Fl = Math.min(3, 4 / (r * r)); FZ.setArrow(o.oF, p, V3(-p.x, 0, -p.z), Fl); FZ.show('k18F', p.clone().add(V3(-p.x, 0, -p.z).normalize().multiplyScalar(Fl + 0.3)).add(V3(0, 0, 0.3)), 1);
      // Kepler 2: son T/8 sürede taranan alan
      const arr = o.fan.geometry.attributes.position.array, M0 = S.M - T / 8 * n;
      for (let i = 0; i < o.N; i++) { const q1 = pos(kep(M0 + (S.M - M0) * i / o.N)), q2 = pos(kep(M0 + (S.M - M0) * (i + 1) / o.N)); arr.set([0, 0.06, 0, q1.x, 0.06, q1.z, q2.x, 0.06, q2.z], i * 9); }
      o.fan.geometry.attributes.position.needsUpdate = true; o.fan.geometry.computeBoundingSphere(); o.fan.visible = !!S.alan;
      FZ.show('k18s', V3(0, 0.5, 0.9), 1);
      FZ.setTag('k18t', `a = ${fs(S.aAU)} AB · T = ${fs(Math.pow(S.aAU, 1.5))} yıl · v = ${fs(sp / 1.2 * 6 / (2 * Math.PI))} (bağıl)`); FZ.show('k18t', V3(-3, 0.5, -4.2), 1);
    },
    qp: (at, S, o) => o.gez.position.clone().add(V3(0, 1.2, 0)) });
  const d18 = ders(s18, { yk: 'AYT18-d1', no: 1, icon: '🌍', name: 'Ay neden yere düşmüyor?', task: 'Newton\'un kütle çekim yasası, yükseklikle g\'nin değişimi, Kepler\'in üç yasası.', steps: [
    { k: { tur: 'merak', b: 'Ay neden Dünya\'ya düşmüyor?', m: ['Aslında düşüyor! Ama yana doğru öyle hızlı gidiyor ki düştükçe Dünya\'yı ıskalıyor.', 'Bunu sağlayan kuvvet: kütle çekim.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Evrensel kütle çekim yasası', f: ['k18F'], m: [`${FM(`F = G ${F('m<sub>1</sub> m<sub>2</sub>', 'd<sup>2</sup>')}`)} · kuvvet her zaman Güneş\'e doğrudur (kırmızı ok).`, `Yüzeyde ${FM(`g = ${F('G M', 'R<sup>2</sup>')}`)} · h yükseklikte ${FM(`g' = g ${F('R<sup>2</sup>', '(R + h)<sup>2</sup>')}`)}`] } },
    { p: { t: 'Gezegen Güneş\'e yaklaşırken hızı nasıl değişir?', o: ['Azalır', 'Değişmez', 'Artar', 'Sıfır olur'], d: 2 } },
    { sub: 'Gezegeni izleyelim; yeşil ok hızını gösteriyor.', go: '▶︎ İzle' },
    { sub: 'Yakınken hızlı, uzakken yavaş…', wait: 6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Günberide en hızlı', f: ['k18v', 'k18F'], m: ['Güneş\'e yaklaşırken çekim kuvvetinin hız yönünde bileşeni gezegeni hızlandırır, uzaklaşırken yavaşlatır.', 'Kırmızı ok da yakınken uzun: kuvvet 1/d² ile değişir.'] } },
    { do: S => { S.alan = 1; }, k: { tur: 'kavram', b: 'Kepler yasaları', f: ['k18t'], m: ['1) Yörüngeler elipstir, Güneş odaklardan birindedir.', '2) Eşit sürelerde eşit alanlar taranır (sarı dilim: hep aynı alan).', `3) ${FM(`${F('T<sup>2</sup>', 'a<sup>3</sup>')} = sabit`)} · AB ve yıl biriminde T² = a³.`] } },
    { x: { b: 'Yörüngenin büyüklüğünü değiştir', m: ['Yarı büyük eksen a büyüdükçe periyot ne olur?'],
      kay: [{ ad: 'aAU', etiket: 'a', min: 1, max: 4, adim: 1, deger: 3, birim: 'AB', set: (S, v) => { S.aAU = v; } }],
      olc: S => `T = ${SQ(`${S._aAU}<sup>3</sup>`)} = <em>${fs(Math.pow(S._aAU, 1.5))} yıl</em><br>a 4 katına çıkınca T 8 katına çıkar.` } },
    { do: S => { S.aAU = 3; }, k: { tur: 'dikkat', b: 'Yörüngedeki astronot ağırlıksız mı?', m: ['Sık yanlış: "Uzayda yer çekimi yoktur."', 'Uzay istasyonunun yüksekliğinde g ≈ 8,7 m/s²\'dir. Astronot istasyonla birlikte serbest düştüğü için ağırlıksız <em>hisseder</em>.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`F = G ${F('m<sub>1</sub> m<sub>2</sub>', 'd<sup>2</sup>')}`)} · ${FM(`g' = g ${F('R<sup>2</sup>', '(R + h)<sup>2</sup>')}`)} · Kepler: elips, eşit alanlar, T² ∝ a³`] } },
  ] });
  const g18 = gorev(s18, { yk: 'AYT18-g1', no: 1, icon: '🛰️', name: 'Yörünge görevi', task: 'Kütle çekim kuvveti, yükseklikte g ve Kepler yasalarını kullanın.', steps: [
    { do: S => { S.alan = 1; }, sub: 'Gezegen Güneş çevresinde eliptik yörüngede.', go: '▶︎ Başlat' },
    { q: { t: 'İki cisim arasındaki uzaklık 2 katına çıkarılırsa aralarındaki kütle çekim kuvveti F, kaç olur?', o: [F('F', '4'), F('F', '2'), '2F', '4F'],
      s: [`F ∝ ${F('1', 'd<sup>2</sup>')} → ${F('1', '2<sup>2</sup>')} = ${F('1', '4')} → <em>${F('F', '4')}</em> ✓`], n: ['Uzaklık karesiyle ters orantılıdır; yarıya değil dörtte bire iner.'] } },
    { q: { t: 'Yüzeyde g = 10 m/s² olan bir gezegende, yüzeyden gezegen yarıçapı (R) kadar yükseklikte g kaç m/s² olur?', o: ['2,5 m/s²', '5 m/s²', '10 m/s²', '1,25 m/s²', '7,5 m/s²'],
      s: [`g' = g ${F('R<sup>2</sup>', '(2R)<sup>2</sup>')} = 10 · ${F('1', '4')} = <em>2,5 m/s²</em> ✓`], n: ['Uzaklık merkezden ölçülür: yüzeyden R yukarıda, merkeze uzaklık 2R\'dir.'] } },
    { do: S => { S.aAU = 4; }, q: { t: 'Güneş\'e ortalama uzaklığı 4 AB olan bir gezegenin periyodu kaç yıldır?', o: ['8 yıl', '4 yıl', '16 yıl', '64 yıl', '24 yıl'], f: ['k18t'],
      s: [`Dünya için T = 1 yıl, a = 1 AB → ${FM('T<sup>2</sup> = a<sup>3</sup>')}`, `T<sup>2</sup> = 4<sup>3</sup> = 64 → <em>T = 8 yıl</em> ✓`], n: ['Kepler\'in 3. yasası aynı merkezi cismin çevresindeki yörüngeler için geçerlidir.'] } },
    { q: { t: 'Gezegenin yörüngede çizgisel hızı en büyük olduğu yer neresidir?', o: ['Güneş\'e en yakın nokta (günberi)', 'Güneş\'e en uzak nokta (günöte)', 'Her yerde aynı', 'Yörüngenin tam ortası'], f: ['k18v'],
      s: ['Kepler 2: eşit sürede eşit alan.', 'Yakında yarıçap küçük → aynı alanı taramak için daha uzun yay almalı → <em>günberide en hızlı</em> ✓'], n: ['Açısal momentum korunumu: m v r sabit → r küçükse v büyük.'] } },
  ] });
  konuEkle('AYT', 'Kütle Çekim ve Kepler Yasaları', { dersler: [d18], gorevler: [g18] });

  // =====================================================================
  // AYT 19 · BASİT HARMONİK HAREKET — sürtünmesiz masada yay-kütle sistemi
  // =====================================================================
  const s19 = sahne({ icon: '〰️', cam: [[1.5, 3.5, 10], [1.5, 1.4, 0]], plate: [10, 4, 0, 0],
    data: [['Kütle', 'm = 4 kg'], ['Yay sabiti', 'k = 16 N/m'], ['Genlik', 'A = 0,5 m'], ['Sürtünme', 'yok']],
    S0: () => ({ m: 4, k: 16, A: 0.5, kos: 0, ph: 0, K: 2.4, vs: 1.2, as: 0.6 }),
    kur(g) {
      kutu(g, 0.3, 1.6, 1.2, 0x64748b, -4, 0.8, 0);
      const yay = new THREE.Group(); yay.position.set(-3.85, 0.5, 0); g.add(yay);
      { const pts = []; for (let i = 0; i <= 240; i++) { const a = i / 240 * 12 * Math.PI * 2; pts.push(V3(i / 240, Math.sin(a) * 0.22, Math.cos(a) * 0.22)); } yay.add(FZ.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.035, 6, false), 0x22c55e, { edge: false })); }
      const blok = kutu(g, 0.8, 0.8, 0.8, 0xef4444, 0, 0.45, 0);
      const den = FZ.cizgi(g, 0x334155); FZ.setLine(den, [V3(0, 0.05, 0.8), V3(0, 1.6, 0.8)]);
      const izl = FZ.cizgi(g, 0x2563eb); izl.material.dashSize = 100; izl.material.gapSize = 0;
      etiket('h19v', 'v', '#16a34a'); etiket('h19a', 'a', '#7c3aed'); kart('h19t', '', '#F5C400'); etiket('h19o', 'denge', '#334155');
      return { yay, blok, den, izl, ov: ok(0x22c55e, 'h19v'), oa: ok(0x8b5cf6, 'h19a'), K: 2.4 }; // K: 1 m → 2,4 birim
    },
    tick(S, dt, o) {
      const w = Math.sqrt(S.k / S.m); if (S.kos) S.ph += w * dt;
      const x = S.A * Math.cos(S.ph), v = -S.A * w * Math.sin(S.ph), a = -w * w * x;
      const bx = x * S.K; o.blok.position.x = bx; o.yay.scale.x = (bx - 0.4 + 3.85);
      if (Math.abs(v) > 0.02) { FZ.setArrow(o.ov, V3(bx, 1.1, 0), V3(Math.sign(v), 0, 0), Math.abs(v) * S.vs); FZ.show('h19v', V3(bx + Math.sign(v) * (Math.abs(v) * S.vs + 0.25), 1.1, 0), 1); }
      if (Math.abs(a) > 0.02) { FZ.setArrow(o.oa, V3(bx, 0.45, 0.5), V3(Math.sign(a), 0, 0), Math.abs(a) * S.as); FZ.show('h19a', V3(bx + Math.sign(a) * (Math.abs(a) * S.as + 0.25), 0.45, 0.5), 1); }
      // x–t grafiği (sağda, zaman aşağı doğru akar)
      const pts = []; for (let i = 0; i <= 80; i++) { const ph = S.ph - i * 0.08; pts.push(V3(S.A * Math.cos(ph) * S.K, 2.2 + i * 0.03, -0.6)); } FZ.setLine(o.izl, pts);
      FZ.show('h19o', V3(0, 1.75, 0.8), 1);
      FZ.setTag('h19t', `x = ${fs(x)} m · v = ${fs(v)} m/s · a = ${fs(a)} m/s²<br>T = 2π${SQ(F('m', 'k'))} = ${fs(2 * Math.PI / w)} s`); FZ.show('h19t', V3(4.2, 3.6, 0), 1);
    },
    qp: (at, S, o) => o.blok.position.clone().add(V3(0, 1.6, 0)) });
  const d19 = ders(s19, { yk: 'AYT19-d1', no: 1, icon: '🕰️', name: 'Saat sarkacı neden hep aynı sürede gider gelir?', task: 'Geri çağırıcı kuvvet, BHH\'de konum-hız-ivme, yay ve sarkacın periyodu.', steps: [
    { k: { tur: 'merak', b: 'Salıncak az da salınsa çok da salınsa bir gidiş-geliş hep aynı sürer. Nasıl?', m: ['Denge konumuna doğru geri çeken bir kuvvet varsa cisim salınır: basit harmonik hareket.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Geri çağırıcı kuvvet', m: [`${FM('F = − k x')} · kuvvet (ve ivme) her zaman <em>denge konumuna doğrudur</em>, uzanımla orantılıdır.`, 'Blok 0,5 m çekilip bırakılacak.'] } },
    { p: { t: 'Bloğun hızı nerede en büyüktür?', o: ['Uç noktalarda', 'Denge konumunda', 'Uç ile denge arasının tam ortasında', 'Her yerde aynı'], d: 1 } },
    { sub: 'Bloğu bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Yeşil ok hız, mor ok ivme…', wait: 7 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Hız ve ivme ters davranır', f: ['h19v', 'h19a'], m: ['Denge konumunda: x = 0, a = 0, <em>v en büyük</em> (v<sub>max</sub> = A ω = 1 m/s).', 'Uç noktalarda: v = 0, <em>|a| en büyük</em> (a<sub>max</sub> = A ω² = 2 m/s²).'] } },
    { k: { tur: 'kavram', b: 'Periyot', f: ['h19t'], m: [`Yay-kütle: ${FM(`T = 2π ${SQ(F('m', 'k'))}`)} · basit sarkaç: ${FM(`T = 2π ${SQ(F('L', 'g'))}`)}`, `${FM(`ω = ${F('2π', 'T')}`)} · ${FM('v<sub>max</sub> = A ω')} · ${FM('a<sub>max</sub> = A ω<sup>2</sup>')}`] } },
    { x: { b: 'Kütleyi değiştir', m: ['Periyot nasıl değişiyor? Mavi çizgi x–t grafiği.'],
      kay: [{ ad: 'm', etiket: 'm', min: 1, max: 16, adim: 3, deger: 4, birim: 'kg', set: (S, v) => { S.m = v; } }],
      olc: S => `T = 2π ${SQ(F(S._m, '16'))} = <em>${fs(2 * Math.PI * Math.sqrt(S._m / 16))} s</em><br>Kütle 4 katına → periyot 2 katına.` } },
    { do: S => { S.m = 4; S._m = 4; }, k: { tur: 'dikkat', b: 'Periyot genliğe bağlı değildir', m: ['Sık yanlış: "Daha çok çekersek daha uzun sürede gider gelir."', 'Genlik artınca yol da hız da artar; T değişmez. Sarkaçta T kütleye de bağlı değildir (küçük açılarda).'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('F = −kx')} · ${FM(`T = 2π ${SQ(F('m', 'k'))}`)} · ${FM(`T = 2π ${SQ(F('L', 'g'))}`)}`, 'Dengede v en büyük, a = 0. Uçlarda v = 0, |a| en büyük.'] } },
  ] });
  const g19 = gorev(s19, { yk: 'AYT19-g1', no: 1, icon: '🪀', name: 'Salınımı çöz', task: 'Periyot, en büyük hız ve ivmeyi bulun.', data: [['Kütle', 'm = 2 kg'], ['Yay sabiti', 'k = 200 N/m'], ['Genlik', 'A = 0,1 m'], ['π', '3 alınız']], steps: [
    { do: S => { S.m = 2; S.k = 200; S.A = 0.1; S.K = 10; S.vs = 1.2; S.as = 0.12; }, sub: 'Yaya bağlı blok sürtünmesiz yüzeyde salınacak.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, q: { t: 'm = 2 kg, k = 200 N/m olan yay-kütle sisteminin periyodu kaç s\'dir? (π = 3)', o: ['0,6 s', '6 s', '0,3 s', '1,2 s', '1,8 s'],
      s: [`${FM(`T = 2π ${SQ(F('m', 'k'))}`)} = 2 · 3 · ${SQ(F('2', '200'))} = 6 · 0,1 = <em>0,6 s</em> ✓`], n: ['Ağır kütle yavaş, sert yay hızlı salınır.'] } },
    { q: { t: 'Genlik 0,1 m ise bloğun en büyük hızı kaç m/s\'dir?', o: ['1 m/s', '10 m/s', '0,1 m/s', '20 m/s', '2 m/s'], f: ['h19v'],
      s: ['§1. YOL · ω ile', `ω = ${SQ(F('k', 'm'))} = ${SQ('100')} = 10 rad/s → v<sub>max</sub> = A ω = 0,1 · 10 = <em>1 m/s</em> ✓`, '§2. YOL · enerji', `${F('1', '2')} k A² = ${F('1', '2')} m v² → 200 · 0,01 = 2 v² → <em>v = 1 m/s</em> ✓`], n: ['En büyük hız denge konumundadır.'] } },
    { q: { t: 'Bloğun en büyük ivmesi kaç m/s²\'dir?', o: ['10 m/s²', '1 m/s²', '100 m/s²', '0'], f: ['h19a'],
      s: ['§1. YOL', 'a<sub>max</sub> = A ω² = 0,1 · 100 = <em>10 m/s²</em> ✓', '§2. YOL', `a<sub>max</sub> = ${F('k A', 'm')} = ${F('200 · 0,1', '2')} = <em>10 m/s²</em> ✓`], n: ['En büyük ivme uç noktalarda, hızın sıfır olduğu yerdedir.'] } },
    { q: { t: 'Uzunluğu 2,5 m olan basit sarkacın periyodu kaç s\'dir? (g = 10 m/s², π = 3)', o: ['3 s', '1,5 s', '6 s', '0,5 s', '9 s'],
      s: [`${FM(`T = 2π ${SQ(F('L', 'g'))}`)} = 2 · 3 · ${SQ(F('2,5', '10'))} = 6 · 0,5 = <em>3 s</em> ✓`], n: ['Sarkacın periyodu kütleye bağlı değildir.'] } },
  ] });
  konuEkle('AYT', 'Basit Harmonik Hareket', { dersler: [d19], gorevler: [g19] });
})();
