// AYT 13 · Düzgün Elektrik Alan ve Sığa — AYT 14 · Manyetizma ve İndüklenme — AYT 15 · Alternatif Akım ve Transformatörler
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(3)).toString().replace('.', ',');
  const bin = x => Math.round(x).toLocaleString('tr-TR');

  // =====================================================================
  // AYT 13 · DÜZGÜN ELEKTRİK ALAN VE SIĞA — paralel levhalar arasında hızlanan yük
  // =====================================================================
  const s13 = sahne({ icon: '🔋', cam: [[1.8, 3.5, 12], [1.8, 2, 0]], plate: [10, 5, 0, 0],
    data: [['μC', '10⁻⁶ C'], ['μF', '10⁻⁶ F']],
    S0: () => ({ V: 200, d: 4, x: 0, v: 0, kos: 0 }),
    kur(g) {
      const A = kutu(g, 0.15, 3, 2, 0xef4444, -2, 2, 0), B = kutu(g, 0.15, 3, 2, 0x3b82f6, 2, 2, 0);
      const p = top(g, 0.16, 0xf97316, -1.8, 2, 0);
      const alan = []; for (let i = 0; i < 4; i++) alan.push(ok(0xfacc15, 'c13e'));
      etiket('c13e', 'E', '#ca8a04'); etiket('c13F', 'F', '#dc2626'); kart('c13t', '', '#F5C400');
      kart('c13p', '+', '#ef4444'); kart('c13n', '−', '#3b82f6'); etiket('c13d', 'd', '#334155');
      const dl = FZ.cizgi(g, 0x334155);
      return { A, B, p, alan, oF: ok(0xef4444, 'c13F'), dl };
    },
    tick(S, dt, o) {
      const yar = 0.25 * S.d; // görsel: d (cm) → levha aralığı
      o.A.position.x = -yar; o.B.position.x = yar;
      const E = S.V / (S.d / 100);
      if (S.kos) { S.v += (E / 5000) * dt * 2; S.x += S.v * dt; if (S.x >= 2 * yar - 0.4) { S.x = 2 * yar - 0.4; S.kos = 0; } }
      const px = -yar + 0.2 + S.x; o.p.position.set(px, 2, 0);
      const L = Math.min(2 * yar - 0.4, E / 5000 * 1.2);
      o.alan.forEach((a, i) => FZ.setArrow(a, V3(-L / 2, 1 + i * 0.6, -0.6), V3(1, 0, 0), L)); FZ.show('c13e', V3(0, 3.4, -0.6), 1);
      FZ.setArrow(o.oF, V3(px, 2.35, 0.3), V3(1, 0, 0), Math.min(1.6, E / 5000 * 0.8)); FZ.show('c13F', V3(px + Math.min(1.6, E / 5000 * 0.8) + 0.25, 2.35, 0.3), 1);
      FZ.show('c13p', V3(-yar, 3.9, 0), 1); FZ.show('c13n', V3(yar, 3.9, 0), 1);
      FZ.setLine(o.dl, [V3(-yar, 0.3, 1.1), V3(yar, 0.3, 1.1)]); FZ.setTag('c13d', `d = ${fs(S.d)} cm`); FZ.show('c13d', V3(0, 0.3, 1.1), 1);
      FZ.setTag('c13t', `V = ${S.V} V · E = ${F('V', 'd')} = ${bin(E)} V/m`); FZ.show('c13t', V3(0, 4.7, 0), 1);
    },
    qp: () => V3(0, 5.3, 0) });
  const d13 = ders(s13, { yk: 'AYT13-d1', no: 1, icon: '📸', name: 'Fotoğraf makinesinin flaşı', task: 'Paralel levhalar arasında düzgün alan, yükün hızlanması, sığa ve kondansatörde depolanan enerji.', steps: [
    { k: { tur: 'merak', b: 'Flaş bir anda nasıl bu kadar parlak çakar?', m: ['Pil, enerjiyi yavaş yavaş bir kondansatöre doldurur; kondansatör hepsini bir anda boşaltır.', 'Kondansatörün içi: karşılıklı iki levha ve aralarında düzgün bir elektrik alan.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Düzgün elektrik alan', f: ['c13e', 'c13t'], m: [`${FM(`E = ${F('V', 'd')}`)} · alan çizgileri paralel, eşit aralıklı: her noktada aynı büyüklük ve yön (+ levhadan − levhaya).`] } },
    { p: { t: 'Gerilim aynı kalırken levhalar arası uzaklık yarıya inerse alan ne olur?', o: ['Yarıya iner', '2 katına çıkar', 'Değişmez', '4 katına çıkar'], d: 1 } },
    { sub: 'Levhaları yaklaştıralım: d = 4 cm → 2 cm.', go: '▶︎ Yaklaştır' },
    { do: S => { S.d = 2; }, sub: 'Sarı alan okları uzadı.', wait: 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'd küçülünce alan büyür', f: ['c13t', 'c13e'], m: [`E = ${F('200', '0,02')} = 10 000 V/m: iki katına çıktı.`] } },
    { do: S => { S.d = 4; S.x = 0; S.v = 0; }, sub: 'Pozitif yükü + levhanın yanından serbest bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Sabit kuvvet → sabit ivme…', until: S => !S.kos },
    { k: { tur: 'kavram', b: 'Yükün kazandığı enerji', f: ['c13F'], m: [`${FM('F = q E')} sabit, yük düzgün hızlanır. ${FM(`W = q V = ${F('1', '2')} m v<sup>2</sup>`)}`, 'Kazanılan enerji yalnız gerilime bağlıdır, levha aralığına bağlı değildir.'] } },
    { k: { tur: 'kavram', b: 'Sığa', m: [`${FM(`C = ${F('Q', 'V')}`)} (farad) · ${FM(`C = ε ${F('A', 'd')}`)}`, `Depolanan enerji: ${FM(`E = ${F('1', '2')} Q V = ${F('1', '2')} C V<sup>2</sup>`)}`] } },
    { x: { b: 'Levha aralığını değiştir', m: ['Gerilim 200 V sabit.'],
      kay: [{ ad: 'd', etiket: 'd', min: 1, max: 6, adim: 1, deger: 4, birim: 'cm', set: (S, v) => { S.d = v; S.x = 0; S.v = 0; } }],
      olc: S => `E = ${F('200', fs(S._d / 100))} = <em>${bin(20000 / S._d)} V/m</em><br>d arttıkça alan da sığa da azalır (C ∝ ${F('1', 'd')}).` } },
    { do: S => { S.d = 4; }, k: { tur: 'dikkat', b: 'Pil bağlı mı, ayrılmış mı?', m: ['Kondansatör pile <em>bağlıyken</em> V sabittir: d değişince Q ve E değişir.', 'Pilden <em>ayrılmışsa</em> Q sabittir: d artınca C azalır, V = Q/C artar.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`E = ${F('V', 'd')}`)} · ${FM('W = qV')} · ${FM(`C = ${F('Q', 'V')} = ε ${F('A', 'd')}`)} · ${FM(`E = ${F('1', '2')} C V<sup>2</sup>`)}`] } },
  ] });
  const g13 = gorev(s13, { yk: 'AYT13-g1', no: 1, icon: '⚡', name: 'Levhaları yükle', task: 'Düzgün alanı, kuvveti, kazanılan enerjiyi ve kondansatör yükünü bulun.', data: [['Gerilim', 'V = 200 V'], ['Levha aralığı', 'd = 4 cm'], ['μC', '10⁻⁶ C'], ['μF', '10⁻⁶ F']], steps: [
    { do: S => { S.V = 200; S.d = 4; }, sub: 'Levhalar arasında 200 V gerilim var.', go: '▶︎ Başlat' },
    { q: { t: 'Levhalar arasındaki elektrik alanın büyüklüğü kaç V/m\'dir?', o: ['5000 V/m', '50 V/m', '800 V/m', '8000 V/m', '10000 V/m'], f: ['c13e', 'c13d'],
      s: [`${FM(`E = ${F('V', 'd')}`)} = ${F('200', '0,04')} = <em>5000 V/m</em> ✓`], n: ['d metreye çevrilmeli: 4 cm = 0,04 m.'] } },
    { q: { t: 'Levhalar arasındaki 2 μC\'luk yüke etki eden elektriksel kuvvet kaç N\'dur?', o: ['0,01 N', '0,1 N', '10 N', '0,0004 N', '0,02 N'], f: ['c13F'],
      s: [`${FM('F = q E')} = 2 · 10<sup>−6</sup> · 5000 = <em>0,01 N</em> ✓`], n: ['Düzgün alanda yük nerede olursa olsun kuvvet aynıdır.'] } },
    { do: S => { S.x = 0; S.v = 0; S.kos = 1; }, q: { t: '2 μC\'luk yük + levhadan − levhaya ulaşınca kinetik enerjisi kaç J artar?', o: ['4 · 10<sup>−4</sup> J', '4 · 10<sup>−2</sup> J', '10<sup>−4</sup> J', '2 · 10<sup>−4</sup> J'],
      s: ['§1. YOL · W = qV', `W = 2 · 10<sup>−6</sup> · 200 = <em>4 · 10<sup>−4</sup> J</em> ✓`, '§2. YOL · W = F · d', `W = 0,01 · 0,04 = <em>4 · 10<sup>−4</sup> J</em> ✓`], n: ['Elektriksel kuvvetin yaptığı iş kinetik enerji artışına eşittir.'] } },
    { q: { t: '5 μF\'lık kondansatör 12 V\'luk pile bağlanıyor. Kondansatörde depolanan yük kaç μC\'dir?', o: ['60 μC', '2,4 μC', '17 μC', '720 μC', '120 μC'],
      s: [`${FM('Q = C V')} = 5 μF · 12 V = <em>60 μC</em> ✓`], n: [`Depolanan enerji: ${F('1', '2')} · 5 · 10<sup>−6</sup> · 144 = 3,6 · 10<sup>−4</sup> J.`] } },
  ] });
  konuEkle('AYT', 'Düzgün Elektrik Alan ve Sığa', { dersler: [d13], gorevler: [g13] });

  // =====================================================================
  // AYT 14 · MANYETİZMA VE İNDÜKLENME — manyetik alanda raylar üzerinde kayan çubuk
  // =====================================================================
  const s14 = sahne({ icon: '🧲', cam: [[1.8, 7, 9], [1.8, 0, 0]], plate: [12, 6, 0, 0],
    data: [['B', '0,5 T (yukarı)'], ['Çubuk boyu', 'L = 0,4 m'], ['Direnç', 'R = 4 Ω']],
    S0: () => ({ B: 0.5, L: 0.4, R: 4, v: 10, x: -2, kos: 0 }),
    kur(g) {
      kutu(g, 10, 0.08, 0.08, 0x94a3b8, 0, 0.1, -1.2); kutu(g, 10, 0.08, 0.08, 0x94a3b8, 0, 0.1, 1.2);
      kutu(g, 0.1, 0.1, 2.4, 0x334155, -5, 0.1, 0); const R = kutu(g, 0.4, 0.3, 0.8, 0xf59e0b, -5, 0.2, 0);
      const cub = kutu(g, 0.15, 0.15, 2.7, 0xb45309, 0, 0.2, 0);
      const Bo = []; for (let i = -4; i <= 4; i += 2) for (let j = -1; j <= 1; j += 2) Bo.push([i + 0.5, j * 2]);
      const Bok = Bo.map(() => ok(0x94a3b8, 'm14B'));
      etiket('m14B', 'B', '#64748b'); etiket('m14v', 'v', '#16a34a'); etiket('m14I', 'I', '#ea580c'); etiket('m14F', 'F<sub>m</sub>', '#dc2626'); kart('m14t', '', '#F5C400'); kart('m14R', 'R', '#b45309');
      return { R, cub, Bo, Bok, ov: ok(0x22c55e, 'm14v'), oI: ok(0xf97316, 'm14I'), oF: ok(0xef4444, 'm14F') };
    },
    tick(S, dt, o) {
      if (S.kos) { S.x += S.v * dt * 0.15; if (S.x > 4.5) S.x = -2; }
      o.cub.position.x = S.x;
      o.Bo.forEach((p, i) => FZ.setArrow(o.Bok[i], V3(p[0], 0.05, p[1]), V3(0, 1, 0), 1)); FZ.show('m14B', V3(4.5, 1.3, -2), 1);
      const e = S.B * S.L * S.v, I = e / S.R, Fm = S.B * I * S.L;
      if (S.v > 0) {
        FZ.setArrow(o.ov, V3(S.x + 0.2, 0.5, -0.6), V3(1, 0, 0), S.v / 8); FZ.show('m14v', V3(S.x + S.v / 8 + 0.5, 0.5, -0.6), 1);
        FZ.setArrow(o.oI, V3(S.x, 0.55, -0.9), V3(0, 0, 1), 1.8); FZ.show('m14I', V3(S.x + 0.35, 0.6, 0.9), 1);
        FZ.setArrow(o.oF, V3(S.x - 0.2, 0.5, 0.6), V3(-1, 0, 0), Fm * 10); FZ.show('m14F', V3(S.x - Fm * 10 - 0.6, 0.5, 0.6), 1); }
      FZ.show('m14R', V3(-5, 0.8, 0), 1);
      FZ.setTag('m14t', `ε = BLv = ${fs(e)} V · I = ${fs(I)} A · F<sub>m</sub> = ${fs(Fm)} N`); FZ.show('m14t', V3(0, 2.3, -1.5), 1);
    },
    qp: (at, S) => V3(S.x, 1.6, 0) });
  const d14 = ders(s14, { yk: 'AYT14-d1', no: 1, icon: '🚲', name: 'Bisiklet dinamosu nasıl ışık yakar?', task: 'Manyetik kuvvet (F = BIL, F = qvB), hareketli iletkende indüksiyon (ε = BLv), Faraday ve Lenz.', steps: [
    { k: { tur: 'merak', b: 'Pil yok; tekerlek dönünce lamba nasıl yanar?', m: ['Bir iletken manyetik alanda hareket edince içinde akım doğar: indüksiyon.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Manyetik kuvvet', f: ['m14B'], m: [`Akım taşıyan tele: ${FM('F = B I L')} · hareketli yüke: ${FM('F = q v B')}`, 'Yön sağ el kuralıyla bulunur; kuvvet hem B\'ye hem harekete (ya da akıma) diktir.', `Düz telin alanı: ${FM(`B = 2 · 10<sup>−7</sup> ${F('I', 'd')}`)}`] } },
    { sub: 'Çubuğu 10 m/s ile raylar üzerinde kaydıralım.', go: '▶︎ Kaydır' },
    { do: S => { S.kos = 1; }, sub: 'Çubuk alan çizgilerini kesiyor…', wait: 3 },
    { k: { tur: 'gozlem', b: 'İndüksiyon akımı doğdu', f: ['m14I', 'm14t'], m: [`${FM('ε = B L v')} = 0,5 · 0,4 · 10 = 2 V · ${FM(`I = ${F('ε', 'R')}`)} = 0,5 A`] } },
    { p: { t: 'Çubuktan akım geçince manyetik alan çubuğa bir kuvvet uygular. Bu kuvvet hangi yöndedir?', o: ['Hareket yönünde (çubuğu hızlandırır)', 'Harekete zıt (çubuğu yavaşlatır)', 'Yukarı doğru', 'Kuvvet oluşmaz'], d: 1 } },
    { k: { tur: 'kavram', sonuc: true, b: 'Lenz kuralı', f: ['m14F', 'm14v'], m: ['İndüksiyon akımı, kendisini oluşturan değişime <em>karşı koyar</em>: F<sub>m</sub> harekete zıttır.', 'Çubuğun sabit hızla gitmesi için dışarıdan F<sub>m</sub> kadar kuvvetle çekilmesi gerekir. Bu iş elektrik enerjisine dönüşür (enerji korunumu).'] } },
    { x: { b: 'Çubuğun hızını değiştir', m: ['Hız arttıkça ne değişiyor?'],
      kay: [{ ad: 'v', etiket: 'v', min: 2, max: 16, adim: 2, deger: 10, birim: 'm/s', set: (S, v) => { S.v = v; } }],
      olc: S => { const e = 0.2 * S._v; return `ε = <em>${fs(e)} V</em> · I = <em>${fs(e / 4)} A</em> · F<sub>m</sub> = <em>${fs(0.2 * e / 4)} N</em><br>Hız 2 katına → ε ve I 2 katına.`; } } },
    { do: S => { S.v = 10; S._v = 10; }, k: { tur: 'kavram', b: 'Faraday yasası', m: [`${FM(`ε = − ${F('ΔΦ', 'Δt')}`)} · Φ = B · A (manyetik akı)`, 'Mıknatısı bobine hızlı sokarsan akı hızlı değişir, ε büyür. Mıknatıs bobin içinde dururken akım yoktur.'] } },
    { k: { tur: 'dikkat', b: 'Akım için değişim gerekir', m: ['Sık yanlış: "Güçlü manyetik alan her zaman akım üretir."', 'Akı <em>değişmiyorsa</em> (çubuk duruyor, mıknatıs hareketsiz) indüksiyon akımı oluşmaz.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('F = BIL')} · ${FM('F = qvB')} · ${FM('ε = BLv')} · ${FM(`ε = − ${F('ΔΦ', 'Δt')}`)}`, 'Lenz: indüksiyon akımı değişime karşı koyar.'] } },
  ] });
  const g14 = gorev(s14, { yk: 'AYT14-g1', no: 1, icon: '🔌', name: 'Raylı jeneratör', task: 'Hareketli çubukta indüksiyon emk\'sı, akım ve manyetik kuvveti bulun.', steps: [
    { do: S => { S.v = 10; }, sub: 'Çubuk 10 m/s sabit hızla çekiliyor.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'Çubuğun uçları arasında oluşan indüksiyon emk\'sı kaç V\'tur?', o: ['2 V', '20 V', '0,2 V', '8 V', '4 V'], f: ['m14B', 'm14v'],
      s: [`${FM('ε = B L v')} = 0,5 · 0,4 · 10 = <em>2 V</em> ✓`], n: ['B, L ve v birbirine dik olduğu için doğrudan çarpılır.'] } },
    { q: { t: 'Devreden geçen akım kaç A\'dir?', o: ['0,5 A', '8 A', '2 A', '0,2 A', '1 A'], f: ['m14I'],
      s: [`${FM(`I = ${F('ε', 'R')}`)} = ${F('2', '4')} = <em>0,5 A</em> ✓`], n: ['Rayların ve çubuğun direnci ihmal edildi.'] } },
    { q: { t: 'Çubuğa etki eden manyetik kuvvetin büyüklüğü kaç N\'dur?', o: ['0,1 N', '1 N', '0,4 N', '2 N', '0,2 N'], f: ['m14F'],
      s: [`${FM('F = B I L')} = 0,5 · 0,5 · 0,4 = <em>0,1 N</em> ✓`], n: [`Kontrol: güç F · v = 0,1 · 10 = 1 W = I<sup>2</sup>R = 0,25 · 4 = 1 W ✓`] } },
    { q: { t: 'Çubuğa etki eden manyetik kuvvetin yönü nedir?', o: ['Hareket yönüne zıt', 'Hareket yönünde', 'Manyetik alan yönünde', 'Akım yönünde'], f: ['m14F', 'm14v'],
      s: ['Lenz kuralı: indüksiyon akımı hareketi engelleyecek yönde kuvvet doğurur.', 'Kuvvet <em>harekete zıttır</em> ✓'], n: ['Kuvvet hareket yönünde olsaydı çubuk kendiliğinden hızlanır, enerji yoktan var olurdu.'] } },
  ] });
  konuEkle('AYT', 'Manyetizma ve İndüklenme', { dersler: [d14], gorevler: [g14] });

  // =====================================================================
  // AYT 15 · ALTERNATİF AKIM VE TRANSFORMATÖRLER — demir çekirdek, iki bobin, lamba
  // =====================================================================
  const s15 = sahne({ icon: '🔌', cam: [[1.5, 3.5, 12], [1.5, 2.2, 0]], plate: [10, 5, 0, 0],
    data: [['Transformatör', 'ideal (kayıpsız)']],
    S0: () => ({ N1: 200, N2: 1000, V1: 220, ac: 1, f: 0.5 }),
    kur(g) {
      const c = 0x6b7280; kutu(g, 0.6, 3.6, 0.6, c, -1.5, 2.2, 0); kutu(g, 0.6, 3.6, 0.6, c, 1.5, 2.2, 0); kutu(g, 3.6, 0.6, 0.6, c, 0, 4.0, 0); kutu(g, 3.6, 0.6, 0.6, c, 0, 0.4, 0);
      const b1 = new THREE.Group(), b2 = new THREE.Group(); b1.position.set(-1.5, 2.2, 0); b2.position.set(1.5, 2.2, 0); g.add(b1, b2);
      const lamba = FZ.ampul(g, 1.1); lamba.position.set(3.6, 1.95, 0);
      const isik = new THREE.PointLight(0xfde68a, 0, 6); isik.position.set(3.6, 2.6, 0.6); g.add(isik);
      const dalga = FZ.cizgi(g, 0x2563eb); dalga.material.dashSize = 100; dalga.material.gapSize = 0;
      const nokta = top(g, 0.08, 0x2563eb, -4, 2, 0);
      kart('t15a', '', '#ef4444'); kart('t15b', '', '#3b82f6'); kart('t15t', '', '#F5C400');
      return { b1, b2, lamba, isik, dalga, nokta, n1: -1, n2: -1 };
    },
    tick(S, dt, o) {
      const sar = (gr, n, renk) => { while (gr.children.length) gr.remove(gr.children[0]); const k = Math.max(2, Math.min(14, Math.round(n / 80))); for (let i = 0; i < k; i++) { const t = FZ.mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 20), renk, { edge: false }); t.rotation.x = Math.PI / 2; t.position.y = -1.2 + 2.4 * (i + 0.5) / k; gr.add(t); } };
      if (o.n1 !== S.N1) { sar(o.b1, S.N1, 0xef4444); o.n1 = S.N1; } if (o.n2 !== S.N2) { sar(o.b2, S.N2, 0x3b82f6); o.n2 = S.N2; }
      const V2 = S.ac ? S.V1 * S.N2 / S.N1 : 0, ph = S.t * S.f * Math.PI * 2;
      const par = Math.min(1, V2 / 1100); o.lamba.parla(par * (0.6 + 0.4 * Math.abs(Math.sin(ph))));
      o.isik.intensity = par * 3;
      const pts = []; for (let i = 0; i <= 60; i++) { const x = -5 + i / 60 * 2.6; pts.push(V3(x, 2.2 + (S.ac ? 0.9 * Math.sin(ph - i / 60 * Math.PI * 2) : 0.9), 0)); } FZ.setLine(o.dalga, pts);
      o.nokta.position.copy(pts[60]);
      FZ.setTag('t15a', `N₁ = ${S.N1} · V₁ = ${S.V1} V ${S.ac ? '(AC)' : '(DC)'}`); FZ.show('t15a', V3(-1.5, -0.3, 0.6), 1);
      FZ.setTag('t15b', `N₂ = ${S.N2} · V₂ = ${bin(V2)} V`); FZ.show('t15b', V3(1.8, -0.3, 0.6), 1);
      FZ.setTag('t15t', `${F('V<sub>2</sub>', 'V<sub>1</sub>')} = ${F('N<sub>2</sub>', 'N<sub>1</sub>')}`); FZ.show('t15t', V3(0, 5, 0), 1);
    },
    qp: () => V3(0, 5.6, 0) });
  const d15 = ders(s15, { yk: 'AYT15-d1', no: 1, icon: '🏭', name: 'Elektrik santralden evimize nasıl gelir?', task: 'Alternatif akım, etkin değer, transformatör, ideal transformatörde güç, AC devre elemanları.', steps: [
    { k: { tur: 'merak', b: 'Santraller elektriği neden binlerce volta yükseltip taşır?', m: ['Yüksek gerilimde aynı güç küçük akımla taşınır; tellerde ısı kaybı (I²R) azalır.', 'Gerilimi yükseltip düşüren cihaz: transformatör.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Alternatif akım', m: ['Yönü ve büyüklüğü periyodik değişen akımdır (Türkiye\'de 50 Hz). Mavi eğri gerilimin zamanla değişimini gösteriyor.', `Etkin (ölçülen) değer: ${FM(`V<sub>etkin</sub> = ${F('V<sub>max</sub>', SQ('2'))}`)} · prizdeki 220 V etkin değerdir (V<sub>max</sub> ≈ 311 V).`] } },
    { p: { t: 'Birinci bobin 200, ikinci bobin 1000 sarımlı. Birinciye 220 V uygulanırsa ikincideki gerilim kaç V olur?', o: ['44 V', '220 V', '1100 V', '4400 V'], d: 2 } },
    { sub: 'Transformatörü çalıştıralım.', go: '▶︎ Çalıştır' },
    { k: { tur: 'gozlem', sonuc: true, b: 'Gerilim sarım sayısıyla orantılı', f: ['t15t', 't15b'], m: [`${FM(`${F('V<sub>2</sub>', 'V<sub>1</sub>')} = ${F('N<sub>2</sub>', 'N<sub>1</sub>')}`)} → V<sub>2</sub> = 220 · ${F('1000', '200')} = 1100 V (yükseltici).`] } },
    { x: { b: 'İkinci bobinin sarım sayısını değiştir', m: ['Lambanın parlaklığını izleyin.'],
      kay: [{ ad: 'N2', etiket: 'N₂', min: 100, max: 1000, adim: 100, deger: 1000, birim: 'sarım', set: (S, v) => { S.N2 = v; } }],
      olc: S => `V<sub>2</sub> = 220 · ${F(S._N2, '200')} = <em>${bin(220 * S._N2 / 200)} V</em><br>${S._N2 > 200 ? 'Yükseltici' : S._N2 < 200 ? 'Düşürücü' : 'Gerilim aynı'} transformatör.` } },
    { do: S => { S.N2 = 1000; S._N2 = 1000; }, k: { tur: 'kavram', b: 'İdeal transformatörde güç', m: [`${FM('V<sub>1</sub> I<sub>1</sub> = V<sub>2</sub> I<sub>2</sub>')} → ${FM(`${F('I<sub>2</sub>', 'I<sub>1</sub>')} = ${F('N<sub>1</sub>', 'N<sub>2</sub>')}`)}`, 'Gerilim yükselirse akım aynı oranda düşer: transformatör enerji üretmez.'] } },
    { p: { t: 'Birinci bobine 220 V\'luk <b>doğru akım</b> (pil) bağlanırsa lamba ne olur?', o: ['Daha parlak yanar', 'Yanmaz', 'Aynı yanar', 'Yanıp söner'], d: 1 } },
    { do: S => { S.ac = 0; }, sub: 'Kaynağı doğru akıma çevirdik.', wait: 2 },
    { k: { tur: 'dikkat', sonuc: true, b: 'Transformatör yalnız AC ile çalışır', f: ['t15a', 't15b'], m: ['Doğru akımda çekirdekteki manyetik akı <em>değişmez</em> → ikinci bobinde indüksiyon olmaz → V<sub>2</sub> = 0.', `AC devrede bobin ve kondansatör de akıma karşı koyar: ${FM('X<sub>L</sub> = 2π f L')} · ${FM(`X<sub>C</sub> = ${F('1', '2π f C')}`)}`] } },
    { do: S => { S.ac = 1; }, k: { tur: 'ozet', b: 'Özet', m: [`${FM(`V<sub>etkin</sub> = ${F('V<sub>max</sub>', SQ('2'))}`)} · ${FM(`${F('V<sub>2</sub>', 'V<sub>1</sub>')} = ${F('N<sub>2</sub>', 'N<sub>1</sub>')}`)} · ideal: V<sub>1</sub>I<sub>1</sub> = V<sub>2</sub>I<sub>2</sub>`, 'Transformatör doğru akımla çalışmaz.'] } },
  ] });
  const g15 = gorev(s15, { yk: 'AYT15-g1', no: 1, icon: '🔋', name: 'Gerilimi ayarla', task: 'Etkin değer, transformatör gerilimi ve akımını hesaplayın.', data: [['Transformatör', 'ideal'], ['N₁', '400 sarım'], ['N₂', '100 sarım']], steps: [
    { do: S => { S.N1 = 400; S.N2 = 100; S.V1 = 220; S.ac = 1; }, sub: 'Düşürücü transformatör çalışıyor.', go: '▶︎ Başlat' },
    { q: { t: 'Bir AC kaynağın en büyük gerilimi 100' + SQ('2') + ' V\'tur. Voltmetre kaç V gösterir?', o: ['100 V', '100' + SQ('2') + ' V', '200 V', '50 V'],
      s: [`${FM(`V<sub>etkin</sub> = ${F('V<sub>max</sub>', SQ('2'))}`)} = ${F('100' + SQ('2'), SQ('2'))} = <em>100 V</em> ✓`], n: ['Voltmetre ve ampermetre etkin değeri gösterir.'] } },
    { q: { t: 'N₁ = 400, N₂ = 100 sarımlı transformatörün birinci bobinine 220 V uygulanıyor. İkinci bobinin gerilimi kaç V\'tur?', o: ['55 V', '880 V', '220 V', '110 V', '27,5 V'], f: ['t15t', 't15b'],
      s: [`V<sub>2</sub> = V<sub>1</sub> · ${F('N<sub>2</sub>', 'N<sub>1</sub>')} = 220 · ${F('100', '400')} = <em>55 V</em> ✓`], n: ['N₂ < N₁ → düşürücü transformatör.'] } },
    { q: { t: 'Birinci bobinden 2 A akım geçiyorsa ikinci bobinden kaç A geçer? (ideal)', o: ['8 A', '0,5 A', '2 A', '4 A', '16 A'],
      s: ['§1. YOL · güç eşitliği', `220 · 2 = 55 · I<sub>2</sub> → <em>I<sub>2</sub> = 8 A</em> ✓`, '§2. YOL · sarım oranı', `I<sub>2</sub> = I<sub>1</sub> · ${F('N<sub>1</sub>', 'N<sub>2</sub>')} = 2 · ${F('400', '100')} = <em>8 A</em> ✓`], n: ['Gerilimi düşüren transformatör akımı aynı oranda yükseltir.'] } },
    { do: S => { S.ac = 0; }, q: { t: 'Kaynak 220 V\'luk doğru akım kaynağıyla değiştirilirse ikinci bobinin gerilimi kaç V olur?', o: ['0', '55 V', '220 V', '880 V'], f: ['t15b'],
      s: ['Doğru akımda manyetik akı sabittir: ΔΦ = 0', `ε = − ${F('ΔΦ', 'Δt')} = 0 → <em>V<sub>2</sub> = 0</em> ✓`], n: ['Anahtarın açılıp kapandığı anlarda kısa süreli indüksiyon olur; sürekli çalışmaz.'] } },
  ] });
  konuEkle('AYT', 'Alternatif Akım ve Transformatörler', { dersler: [d15], gorevler: [g15] });
})();
