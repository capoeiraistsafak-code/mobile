// AYT 20 · Dalga Mekaniği — AYT 21 · Atom Fiziğine Giriş ve Radyoaktivite — AYT 22 · Modern Fizik — AYT 23 · Modern Fiziğin Uygulamaları
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  // dalga boyundan (nm) yaklaşık renk
  const renkNm = l => { let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    const c = new THREE.Color(Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))); if (l < 380 || l > 750) c.setRGB(0.5, 0.5, 0.55); return c; };
  FZ.renkNm = renkNm;

  // =====================================================================
  // AYT 20 · DALGA MEKANİĞİ — dalga leğeninde iki noktasal kaynak (1 birim = 4 cm)
  // =====================================================================
  const s20 = sahne({ icon: '🌊', cam: [[1.3, 8, 6.5], [1.3, 0, 1.2]], plate: [10, 8, 0, 1.5],
    data: [['Dalga boyu', 'λ = 4 cm'], ['Kaynaklar', 'aynı fazda']],
    S0: () => ({ lam: 1, P: 1 }),
    kur(g) {
      const geo = new THREE.PlaneGeometry(9, 6.5, 120, 90); geo.rotateX(-Math.PI / 2); geo.translate(0, 0.2, 2.75);
      const su = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })); g.add(su);
      const k1 = top(g, 0.12, 0xef4444, -1.5, 0.3, 0), k2 = top(g, 0.12, 0xef4444, 1.5, 0.3, 0), P = top(g, 0.1, 0x111827, -1.875, 0.35, 2.977);
      const l1 = FZ.cizgi(g, 0xb91c1c), l2 = FZ.cizgi(g, 0x1d4ed8);
      etiket('w20a', 'K₁', '#dc2626'); etiket('w20b', 'K₂', '#dc2626'); etiket('w20p', 'P', '#111827'); kart('w20t', '', '#F5C400');
      return { su, k1, k2, P, l1, l2 };
    },
    tick(S, dt, o) {
      const pos = o.su.geometry.attributes.position, k = 2 * Math.PI / S.lam, w = 2 * Math.PI * 0.8;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), r1 = Math.hypot(x + 1.5, z), r2 = Math.hypot(x - 1.5, z);
        pos.setY(i, 0.2 + 0.07 * (Math.sin(k * r1 - w * S.t) + Math.sin(k * r2 - w * S.t))); }
      pos.needsUpdate = true; o.su.geometry.computeVertexNormals();
      FZ.show('w20a', V3(-1.5, 0.8, 0), 1); FZ.show('w20b', V3(1.5, 0.8, 0), 1);
      const Pp = o.P.position; o.l1.visible = o.l2.visible = false; o.P.visible = !!S.P; if (S.P) { FZ.setLine(o.l1, [V3(-1.5, 0.4, 0), Pp]); FZ.setLine(o.l2, [V3(1.5, 0.4, 0), Pp]); FZ.show('w20p', Pp.clone().add(V3(0, 0.5, 0)), 1); }
      const r1 = Math.hypot(Pp.x + 1.5, Pp.z) * 4, r2 = Math.hypot(Pp.x - 1.5, Pp.z) * 4, fark = Math.abs(r2 - r1) / (4 * S.lam);
      FZ.setTag('w20t', `|PK₂ − PK₁| = ${fs(Math.abs(r2 - r1))} cm = ${fs(fark)} λ`); FZ.show('w20t', V3(2.6, 0.4, 4.6), S.P ? 1 : 0);
    },
    qp: (at, S, o) => o.P.position.clone().add(V3(0, 1.3, 0)) });
  const d20 = ders(s20, { yk: 'AYT20-d1', no: 1, icon: '🎧', name: 'Gürültü önleyici kulaklık', task: 'Dalga denklemi, girişim (yol farkı), kırınım ve çift yarık deneyi.', steps: [
    { k: { tur: 'merak', b: 'Kulaklık sesi sesle nasıl susturur?', m: ['Kulaklık, gürültünün tersi bir ses dalgası üretir. İki dalga üst üste gelince birbirini yok edebilir: girişim.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Girişim', m: [`${FM('v = λ · f')} · iki aynı fazlı kaynakta bir noktadaki sonuç <em>yol farkına</em> bağlıdır.`, `Yol farkı = n λ → <em>katar</em> (kuvvetlendirici). Yol farkı = (n − ${F('1', '2')}) λ → <em>düğüm</em> (söndürücü).`] } },
    { do: S => { S.P = 0; }, sub: 'Dalga leğenini izleyin: hiç dalgalanmayan çizgiler var.', wait: 4 },
    { do: S => { S.P = 1; }, p: { t: 'P noktası K₁\'den 12 cm, K₂\'den 18 cm uzakta, λ = 4 cm. P noktasında ne olur?', o: ['Çok güçlü titreşir (katar)', 'Hiç titreşmez (düğüm)', 'Yalnız K₁\'in dalgası ulaşır', 'Dalga hızı artar'], d: 1 } },
    { sub: 'P noktasına bakalım.', go: '▶︎ Bak' },
    { k: { tur: 'gozlem', sonuc: true, b: 'P düğüm çizgisi üzerinde', f: ['w20t', 'w20p'], m: ['Yol farkı 6 cm = 1,5 λ = (2 − ½) λ → <em>2. düğüm çizgisi</em>.', 'Bir dalganın tepesi, diğerinin çukuruyla buluşur.'] } },
    { x: { b: 'Dalga boyunu değiştir', m: ['Kaynak frekansını değiştirince λ değişir; düğüm çizgilerinin sayısı ne oluyor?'],
      kay: [{ ad: 'lam', etiket: 'λ', min: 0.5, max: 1.5, adim: 0.25, deger: 1, birim: '× 4 cm', set: (S, v) => { S.lam = v; } }],
      olc: S => `λ = <em>${fs(4 * S._lam)} cm</em> · P\'de yol farkı = <em>${fs(6 / (4 * S._lam))} λ</em><br>λ küçülünce çizgiler sıklaşır.` } },
    { do: S => { S.lam = 1; S._lam = 1; }, k: { tur: 'ornek', b: 'Işıkta girişim: çift yarık', m: [`Perdedeki saçak aralığı: ${FM(`Δx = ${F('λ L', 'd')}`)} (L: perde uzaklığı, d: yarıklar arası)`, 'λ = 600 nm, L = 2 m, d = 0,3 mm → Δx = 4 mm.'] } },
    { k: { tur: 'dikkat', b: 'Kırınım', m: ['Dalga, aralık genişliği dalga boyuna yakın olduğunda belirgin şekilde bükülür (kırınım).', 'Düzenek suya konursa λ küçülür → saçaklar sıklaşır. Frekans ortam değiştirince değişmez.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('v = λ f')} · katar: nλ · düğüm: (n − ${F('1', '2')})λ · ${FM(`Δx = ${F('λ L', 'd')}`)}`] } },
  ] });
  const g20 = gorev(s20, { yk: 'AYT20-g1', no: 1, icon: '🌊', name: 'Dalga leğeni', task: 'Girişim deseninde yol farkı, dalga hızı ve saçak aralığını bulun.', steps: [
    { sub: 'İki kaynak aynı fazda dalga üretiyor.', go: '▶︎ Başlat' },
    { q: { t: 'P, K₁\'den 12 cm ve K₂\'den 18 cm uzaktadır; λ = 4 cm. P hangi çizgi üzerindedir?', o: ['2. düğüm çizgisi', '1. katar çizgisi', 'Merkez katar çizgisi', '3. düğüm çizgisi'], f: ['w20t', 'w20p'],
      s: ['Yol farkı = 18 − 12 = 6 cm', `${F('6', '4')} = 1,5 λ = (2 − ${F('1', '2')}) λ → <em>2. düğüm çizgisi</em> ✓`], n: ['Tam sayı × λ → katar, buçuklu × λ → düğüm.'] } },
    { q: { t: 'Kaynakların frekansı 5 Hz ise dalgaların hızı kaç cm/s\'dir?', o: ['20 cm/s', '0,8 cm/s', '1,25 cm/s', '9 cm/s'],
      s: [`${FM('v = λ f')} = 4 · 5 = <em>20 cm/s</em> ✓`], n: ['Dalga hızını ortam belirler; frekansı kaynak belirler.'] } },
    { q: { t: 'Çift yarık deneyinde λ = 500 nm, L = 1,5 m, d = 0,25 mm. Saçak aralığı kaç mm\'dir?', o: ['3 mm', '0,3 mm', '30 mm', '1,5 mm'],
      s: [`${FM(`Δx = ${F('λ L', 'd')}`)} = ${F('5 · 10<sup>−7</sup> · 1,5', '2,5 · 10<sup>−4</sup>')} = 3 · 10<sup>−3</sup> m = <em>3 mm</em> ✓`], n: ['Birimleri metreye çevirmeyi unutmayın.'] } },
    { q: { t: 'Aynı deney kırılma indisi 4/3 olan suda yapılırsa saçak aralığı kaç mm olur?', o: ['2,25 mm', '3 mm', '4 mm', '1,5 mm'],
      s: [`Suda λ' = ${F('λ', 'n')} = λ · ${F('3', '4')}`, `Δx' = 3 · ${F('3', '4')} = <em>2,25 mm</em> ✓`], n: ['Işığın frekansı değişmez, hızı ve dalga boyu n kat azalır.'] } },
  ] });
  konuEkle('AYT', 'Dalga Mekaniği', { dersler: [d20], gorevler: [g20] });

  // =====================================================================
  // AYT 21 · ATOM FİZİĞİ VE RADYOAKTİVİTE — Bohr atomu (r ∝ n²) ve bozunan çekirdekler
  // =====================================================================
  const s21 = sahne({ icon: '⚛️', cam: [[1.5, 8.5, 6], [1.5, 0, 0]], plate: [12, 10, 0, 0],
    data: [['Hidrojen', 'Eₙ = −13,6 / n² eV'], ['hc', '1240 eV·nm']],
    S0: () => ({ mod: 'atom', n: 3, hedef: 3, ae: 0, foton: -1, tt: 0, kos: 0, T: 2 }),
    kur(g) {
      const atom = new THREE.Group(); g.add(atom); top(atom, 0.18, 0xef4444, 0, 0.4, 0);
      [1, 2, 3, 4].forEach(n => { const r = 0.28 * n * n, pts = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 2; pts.push(V3(r * Math.cos(a), 0.4, r * Math.sin(a))); } const l = FZ.cizgi(atom, 0x64748b); FZ.setLine(l, pts); });
      const e = top(atom, 0.12, 0x3b82f6, 0.28, 0.4, 0);
      const dalga = FZ.cizgi(g, 0xef4444); dalga.material.dashSize = 100; dalga.material.gapSize = 0;
      const cek = new THREE.Group(); g.add(cek); const nuk = [];
      for (let i = 0; i < 64; i++) { const m = top(cek, 0.16, 0x22c55e, -2.1 + (i % 8) * 0.6, 0.3, -2.1 + Math.floor(i / 8) * 0.6); m.userData.t = -Math.log2(Math.random() || 0.5); nuk.push(m); }
      ['a21n1', 'a21n2', 'a21n3', 'a21n4'].forEach(id => kart(id, '', '#475569')); etiket('a21e', 'e⁻', '#2563eb'); kart('a21t', '', '#F5C400');
      return { atom, e, dalga, cek, nuk };
    },
    tick(S, dt, o) {
      const at = S.mod === 'atom'; o.atom.visible = at; o.cek.visible = !at; o.dalga.visible = false;
      if (at) {
        if (S.n !== S.hedef) { const yukari = S.hedef > S.n; S.n = S.hedef; if (!yukari) { S.foton = 0; FZ.SFX.ding(); } } // geçiş anlıktır (kuantum sıçraması)
        S.ae += dt * 2.5 / (S.n * S.n * S.n) * 3; const r = 0.28 * S.n * S.n; o.e.position.set(r * Math.cos(S.ae), 0.4, r * Math.sin(S.ae));
        if (S.foton >= 0) { S.foton += dt; const p0 = o.e.position.clone(), pts = []; for (let i = 0; i <= 50; i++) { const s = S.foton * 3 - i * 0.04; if (s < 0) break; pts.push(p0.clone().add(V3(s, 0.2 * Math.sin(s * 14), -s * 0.3))); }
          if (pts.length > 1) FZ.setLine(o.dalga, pts); else o.dalga.visible = false; if (S.foton > 3) S.foton = -1; }
        [1, 2, 3, 4].forEach(n => { FZ.setTag('a21n' + n, `n = ${n} · ${fs(-13.6 / (n * n))} eV`); FZ.show('a21n' + n, V3(-0.28 * n * n * 0.71, 0.4, 0.28 * n * n * 0.71), 0.9); });
        FZ.show('a21e', o.e.position.clone().add(V3(0, 0.45, 0)), 1);
        FZ.setTag('a21t', `E<sub>n</sub> = −${F('13,6', 'n<sup>2</sup>')} eV · r ∝ n<sup>2</sup>`); FZ.show('a21t', V3(4.2, 0.4, -3.6), 1);
      } else {
        if (S.kos) S.tt += dt; const gun = S.tt / 2 * S.T; let N = 0;
        o.nuk.forEach(m => { const sag = m.userData.t * S.T > gun; if (sag) N++; m.material.color.setHex(sag ? 0x22c55e : 0x94a3b8); m.scale.setScalar(sag ? 1 : 0.6); });
        FZ.setTag('a21t', `t = ${fs(gun)} gün · kalan çekirdek: ${N} / 64<br>(yarı ömür ${S.T} gün · hızlandırılmış)`); FZ.show('a21t', V3(4.2, 0.4, -3.6), 1);
      }
    },
    qp: () => V3(0, 2.2, 0) });
  const d21 = ders(s21, { yk: 'AYT21-d1', no: 1, icon: '🎆', name: 'Havai fişeklerin renkleri nereden gelir?', task: 'Bohr atom modeli, enerji seviyeleri, foton salma; α, β, γ bozunumları ve yarı ömür.', steps: [
    { k: { tur: 'merak', b: 'Stronsiyum kırmızı, bakır yeşil yanar. Neden her elementin kendi rengi var?', m: ['Atomdaki elektronlar yalnız belirli enerji seviyelerinde bulunabilir. Seviyeler arası geçiş belirli renkte ışık verir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Bohr modeli (hidrojen)', f: ['a21t'], m: [`${FM(`E<sub>n</sub> = − ${F('13,6', 'n<sup>2</sup>')} eV`)} · yörünge yarıçapı ${FM('r<sub>n</sub> ∝ n<sup>2</sup>')}`, 'Elektron şu an n = 3 seviyesinde (uyarılmış).'] } },
    { p: { t: 'Elektron n = 3\'ten n = 2\'ye inerse ne olur?', o: ['Enerji soğurur', '1,89 eV\'luk foton yayar', '13,6 eV\'luk foton yayar', 'Atom iyonlaşır'], d: 1 } },
    { sub: 'Elektronu bir alt seviyeye indirelim.', go: '▶︎ İndir' },
    { do: S => { S.hedef = 2; }, sub: 'Elektron iniyor, foton çıkıyor…', wait: 3.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Foton enerjisi = seviye farkı', f: ['a21n2', 'a21n3'], m: [`E<sub>foton</sub> = −1,51 − (−3,40) = 1,89 eV · ${FM(`λ = ${F('h c', 'E')}`)} = ${F('1240', '1,89')} ≈ 656 nm → <em>kırmızı</em>`, 'Elektron yukarı çıkarken aynı enerjiyi soğurur.'] } },
    { do: S => { S.mod = 'cekirdek'; S.tt = 0; }, k: { tur: 'kavram', b: 'Radyoaktif bozunma', m: ['α: helyum çekirdeği yayar → Z 2, A 4 azalır.', 'β⁻: nötron protona dönüşür → Z 1 artar, A değişmez. γ: yalnız enerji yayar → Z, A değişmez.'] } },
    { p: { t: '64 çekirdeğin yarı ömrü 2 gün. 4 gün sonra yaklaşık kaç çekirdek bozunmadan kalır?', o: ['32', '16', '0', '8'], d: 1 } },
    { sub: 'Zamanı hızlandırarak izleyelim.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Gri olanlar bozundu…', until: S => S.tt >= 4 },
    { do: S => { S.kos = 0; }, k: { tur: 'gozlem', sonuc: true, b: 'Her yarı ömürde yarıya iner', f: ['a21t'], m: [`${FM(`N = N<sub>0</sub> · (${F('1', '2')})<sup>t / T</sup>`)} → 64 → 32 → 16`, 'Sayı yaklaşık 16 çıkar: bozunma rastgeledir, yarı ömür <em>istatistiksel</em> bir ortalamadır.'] } },
    { k: { tur: 'dikkat', b: 'Hangi çekirdeğin bozunacağı bilinemez', m: ['Sık yanlış: "2 yarı ömür sonra hepsi biter."', 'Her yarı ömürde kalanların yarısı bozunur: ¼, ⅛, … hiçbir zaman tam sıfır olmaz.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`E<sub>n</sub> = − ${F('13,6', 'n<sup>2</sup>')} eV`)} · ${FM('E<sub>foton</sub> = E<sub>üst</sub> − E<sub>alt</sub>')} · ${FM(`N = N<sub>0</sub> (${F('1', '2')})<sup>t/T</sup>`)}`, 'α: Z−2, A−4 · β⁻: Z+1 · γ: değişmez'] } },
  ] });
  const g21 = gorev(s21, { yk: 'AYT21-g1', no: 1, icon: '☢️', name: 'Atom laboratuvarı', task: 'Enerji seviyeleri, foton enerjisi, bozunma ve yarı ömür soruları.', steps: [
    { do: S => { S.mod = 'atom'; S.n = 4; S.hedef = 4; }, sub: 'Hidrojen atomunda elektron n = 4 seviyesinde.', go: '▶︎ Başlat' },
    { q: { t: 'Hidrojen atomunda n = 2 seviyesinin enerjisi kaç eV\'tur?', o: ['−3,4 eV', '−6,8 eV', '−13,6 eV', '−1,51 eV'], f: ['a21n2'],
      s: [`E<sub>2</sub> = − ${F('13,6', '2<sup>2</sup>')} = <em>−3,4 eV</em> ✓`], n: ['Enerjilerin negatif olması elektronun atoma bağlı olduğunu gösterir.'] } },
    { do: S => { S.hedef = 2; }, q: { t: 'Elektron n = 4\'ten n = 2\'ye inerken yayılan fotonun enerjisi kaç eV\'tur?', o: ['2,55 eV', '0,85 eV', '3,4 eV', '4,25 eV'], f: ['a21n4', 'a21n2'],
      s: ['E<sub>4</sub> = −13,6/16 = −0,85 eV · E<sub>2</sub> = −3,4 eV', 'E<sub>foton</sub> = −0,85 − (−3,4) = <em>2,55 eV</em> ✓'], n: ['Bu foton yaklaşık 486 nm\'lik mavi-yeşil ışıktır.'] } },
    { q: { t: '²³⁸₉₂U çekirdeği bir α parçacığı yayınlıyor. Oluşan çekirdeğin kütle ve atom numarası nedir?', o: ['A = 234, Z = 90', 'A = 238, Z = 90', 'A = 234, Z = 92', 'A = 238, Z = 93'],
      s: ['α = ⁴₂He', 'A: 238 − 4 = 234 · Z: 92 − 2 = 90 → <em>²³⁴₉₀Th</em> ✓'], n: ['Bozunmalarda hem kütle numarası hem yük korunur.'] } },
    { do: S => { S.mod = 'cekirdek'; S.tt = 0; S.kos = 1; }, q: { t: 'Yarı ömrü 5 gün olan 800 g\'lık radyoaktif maddenin 15 gün sonra kaç g\'ı bozunmadan kalır?', o: ['100 g', '200 g', '400 g', '0'], f: ['a21t'],
      s: [`${F('15', '5')} = 3 yarı ömür`, '800 → 400 → 200 → <em>100 g</em> ✓'], n: ['Bozunan miktar 700 g\'dır; soruda hangisinin sorulduğuna dikkat.'] } },
  ] });
  konuEkle('AYT', 'Atom Fiziğine Giriş ve Radyoaktivite', { dersler: [d21], gorevler: [g21] });

  // =====================================================================
  // AYT 22 · MODERN FİZİK — fotoelektrik olay
  // =====================================================================
  const s22 = sahne({ icon: '💡', cam: [[1.5, 4, 10], [1.5, 1.8, 0]], plate: [10, 5, 0, 0],
    data: [['Metal', 'W₀ = 2,3 eV'], ['hc', '1240 eV·nm']],
    S0: () => ({ Ef: 1.8, siddet: 1, ac: 0, el: [], fo: [], zam: 0 }),
    kur(g) {
      const lev = kutu(g, 0.2, 2.4, 1.6, 0x9ca3af, 0, 1.6, 0);
      const lamba = silindir(g, 0.3, 0.45, 0.8, 0x334155, -3.4, 3.4, 0); lamba.rotation.z = Math.PI / 2 + 0.5;
      const fot = [], ele = []; for (let i = 0; i < 30; i++) { fot.push(top(g, 0.07, 0xffffff, 0, -5, 0, { edge: false })); ele.push(top(g, 0.1, 0xef4444, 0, -5, 0, { edge: false })); }
      kart('p22t', '', '#F5C400'); kart('p22m', 'Metal', '#475569'); etiket('p22e', 'e⁻', '#dc2626');
      return { fot, ele };
    },
    tick(S, dt, o) {
      const lam = 1240 / S.Ef, c = renkNm(lam), Ek = S.Ef - 2.3;
      if (S.ac) { S.zam += dt * 6 * S.siddet; while (S.zam > 1) { S.zam -= 1; S.fo.push({ s: 0, y: 1 + Math.random() * 1.2 }); } }
      S.fo.forEach(f => f.s += dt * 1.4); S.fo = S.fo.filter(f => { if (f.s >= 1) { if (Ek > 0) S.el.push({ s: 0, y: f.y, z: (Math.random() - 0.5) }); return false; } return true; });
      S.el.forEach(e => e.s += dt * Math.sqrt(Math.max(Ek, 0)) * 1.2); S.el = S.el.filter(e => e.s < 3).slice(-30); S.fo = S.fo.slice(-30);
      o.fot.forEach((m, i) => { const f = S.fo[i]; if (!f) { m.visible = false; return; } m.visible = true; m.material.color.copy(c); m.position.set(-3 + f.s * 2.85, 3.2 - f.s * (3.2 - f.y), 0); });
      o.ele.forEach((m, i) => { const e = S.el[i]; if (!e) { m.visible = false; return; } m.visible = true; m.position.set(0.2 + e.s * 1.6, e.y + e.s * 0.2, e.z + e.z * e.s); });
      if (S.el.length) FZ.show('p22e', o.ele[0].position.clone().add(V3(0, 0.35, 0)), 1);
      FZ.show('p22m', V3(0, 3.1, 0), 1);
      FZ.setTag('p22t', `E<sub>foton</sub> = ${fs(S.Ef)} eV (λ ≈ ${Math.round(lam)} nm) · E<sub>k,max</sub> = ${Ek > 0 ? fs(Ek) + ' eV' : 'elektron yok'}`); FZ.show('p22t', V3(1.2, 4.4, 0), 1);
    },
    qp: () => V3(0, 4.9, 0) });
  const d22 = ders(s22, { yk: 'AYT22-d1', no: 1, icon: '☀️', name: 'Işık bir dalga mı, tanecik mi?', task: 'Foton, fotoelektrik olay, eşik enerjisi, kesme gerilimi, de Broglie dalga boyu ve özel görelilik.', steps: [
    { k: { tur: 'merak', b: 'Güneş paneli ışıktan nasıl elektrik üretir?', m: ['Işık metal yüzeye çarpınca elektron koparabilir: fotoelektrik olay.', 'Bu olayı ancak ışığı "enerji paketleri" (foton) olarak düşünürsek açıklayabiliriz.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Foton', m: [`${FM(`E = h f = ${F('h c', 'λ')}`)} · hc ≈ 1240 eV·nm`, 'Metalden elektron koparmak için gereken en küçük enerji: bağlanma enerjisi W₀ (burada 2,3 eV).'] } },
    { p: { t: 'Kırmızı ışığın (1,8 eV) şiddetini çok artırırsak metalden elektron kopar mı?', o: ['Evet, şiddet yeterince artarsa', 'Hayır, şiddet ne olursa olsun', 'Yalnız çok uzun süre beklersek', 'Yalnız metal ısınınca'], d: 1 } },
    { sub: 'Çok şiddetli kırmızı ışık gönderelim.', go: '▶︎ Işığı aç' },
    { do: S => { S.ac = 1; S.siddet = 3; }, sub: 'Bol foton… ama elektron yok.', wait: 3.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Önemli olan fotonun enerjisi', f: ['p22t'], m: ['Her foton tek bir elektronla etkileşir. 1,8 eV < 2,3 eV: hiçbir foton tek başına elektron koparamaz.', 'Dalga modeli bunu açıklayamadı; Einstein foton fikriyle açıkladı.'] } },
    { do: S => { S.Ef = 3.1; S.siddet = 1; }, k: { tur: 'kavram', b: 'Einstein denklemi', f: ['p22t', 'p22e'], m: [`Mor ışık (3,1 eV): ${FM('E<sub>k,max</sub> = h f − W<sub>0</sub>')} = 3,1 − 2,3 = 0,8 eV`, `Elektronları durduran gerilim: ${FM('e V<sub>k</sub> = E<sub>k,max</sub>')} → V<sub>k</sub> = 0,8 V`] } },
    { x: { b: 'Işığın rengini (foton enerjisini) değiştir', m: ['Elektronlar ne zaman kopuyor, ne kadar hızlı gidiyor?'],
      kay: [{ ad: 'Ef', etiket: 'E<sub>foton</sub>', min: 1.6, max: 4.4, adim: 0.4, deger: 3.2, birim: 'eV', set: (S, v) => { S.Ef = v; } }],
      olc: S => S._Ef > 2.3 ? `E<sub>k,max</sub> = ${fs(S._Ef)} − 2,3 = <em>${fs(S._Ef - 2.3)} eV</em>` : `${fs(S._Ef)} eV < W₀ → <em>elektron kopmaz</em>` } },
    { do: S => { S.Ef = 3.1; }, k: { tur: 'dikkat', b: 'Şiddet sayıyı, frekans enerjiyi belirler', m: ['Şiddet artarsa kopan elektron <em>sayısı</em> (akım) artar, en büyük kinetik enerji değişmez.', 'Frekans artarsa elektronların en büyük kinetik enerjisi artar.'] } },
    { k: { tur: 'ornek', b: 'Madde dalgası ve görelilik', m: [`de Broglie: her parçacığın dalga boyu vardır: ${FM(`λ = ${F('h', 'm v')}`)}`, `Özel görelilik: ışık hızı herkese göre aynıdır; hızlı hareket eden saat yavaş işler. ${FM('E = m c<sup>2</sup>')}`] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`E = h f = ${F('hc', 'λ')}`)} · ${FM('E<sub>k,max</sub> = hf − W<sub>0</sub>')} · ${FM('eV<sub>k</sub> = E<sub>k,max</sub>')} · ${FM(`λ = ${F('h', 'mv')}`)}`] } },
  ] });
  const g22 = gorev(s22, { yk: 'AYT22-g1', no: 1, icon: '🔦', name: 'Fotoselde ölçüm', task: 'Foton enerjisi, kopan elektronun kinetik enerjisi ve kesme gerilimini bulun.', data: [['Metal', 'W₀ = 2,3 eV'], ['hc', '1240 eV·nm']], steps: [
    { do: S => { S.Ef = 2; S.ac = 1; }, sub: 'Metal yüzeye ışık gönderiliyor.', go: '▶︎ Başlat' },
    { q: { t: 'Dalga boyu 620 nm olan ışığın bir fotonunun enerjisi kaç eV\'tur?', o: ['2 eV', '0,5 eV', '3,1 eV', '6,2 eV'], f: ['p22t'],
      s: [`${FM(`E = ${F('h c', 'λ')}`)} = ${F('1240', '620')} = <em>2 eV</em> ✓`], n: ['2 eV < 2,3 eV olduğu için bu ışık metalden elektron koparamaz.'] } },
    { do: S => { S.Ef = 4; }, q: { t: 'Metale 4 eV\'luk fotonlar gönderiliyor. Kopan elektronların en büyük kinetik enerjisi kaç eV\'tur?', o: ['1,7 eV', '6,3 eV', '4 eV', '2,3 eV'], f: ['p22t', 'p22e'],
      s: [`${FM('E<sub>k,max</sub> = h f − W<sub>0</sub>')} = 4 − 2,3 = <em>1,7 eV</em> ✓`], n: ['"En büyük" denmesinin sebebi: daha derindeki elektronlar daha az enerjiyle çıkar.'] } },
    { q: { t: 'Bu elektronları durdurmak için gereken kesme gerilimi kaç V\'tur?', o: ['1,7 V', '4 V', '2,3 V', '6,3 V'],
      s: [`${FM('e V<sub>k</sub> = E<sub>k,max</sub>')} → 1,7 eV = e · V<sub>k</sub> → <em>V<sub>k</sub> = 1,7 V</em> ✓`], n: ['eV birimi: 1 elektronun 1 V\'luk gerilimde kazandığı enerjidir.'] } },
    { do: S => { S.siddet = 2.5; }, q: { t: 'Aynı renkteki ışığın şiddeti iki katına çıkarılırsa ne olur?', o: ['Kopan elektron sayısı artar, E<sub>k,max</sub> değişmez', 'E<sub>k,max</sub> iki katına çıkar', 'Hiçbir şey değişmez', 'Kesme gerilimi iki katına çıkar'],
      s: ['Şiddet = birim sürede gelen foton sayısı → kopan elektron sayısı (akım) artar.', 'Her fotonun enerjisi aynı → <em>E<sub>k,max</sub> ve kesme gerilimi değişmez</em> ✓'], n: ['Sık yanlış: şiddet ile enerjiyi karıştırmak.'] } },
  ] });
  konuEkle('AYT', 'Modern Fizik', { dersler: [d22], gorevler: [g22] });

  // =====================================================================
  // AYT 23 · MODERN FİZİĞİN UYGULAMALARI — LED ve lazer
  // =====================================================================
  const s23 = sahne({ icon: '🔬', cam: [[1.5, 4, 10], [1.5, 1.6, 0]], plate: [10, 5, 0, 0],
    data: [['hc', '1240 eV·nm']],
    S0: () => ({ Eg: 2, mod: 'led', faz: 0 }),
    kur(g) {
      const led = new THREE.Group(); led.position.set(-2, 0, 0); g.add(led);
      const kub = FZ.mesh(new THREE.SphereGeometry(0.6, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0xffffff, { op: 0.85 }); kub.position.y = 1.2; led.add(kub);
      kutu(led, 1.2, 0.2, 1.2, 0x334155, 0, 1.1, 0); kutu(led, 0.06, 1, 0.06, 0x9ca3af, -0.25, 0.5, 0, { edge: false }); kutu(led, 0.06, 1, 0.06, 0x9ca3af, 0.25, 0.5, 0, { edge: false });
      const isik = new THREE.PointLight(0xffffff, 2, 5); isik.position.set(0, 2, 0.5); led.add(isik);
      const laz = new THREE.Group(); laz.position.set(-3, 1.6, 0); g.add(laz); FZ.lazerCihazi(laz);
      const isin = silindir(laz, 0.05, 0.05, 6, 0xef4444, 3.95, 0, 0, { edge: false }); isin.rotation.z = Math.PI / 2; isin.material.emissive = new THREE.Color(0xff0000); isin.material.emissiveIntensity = 0.8;
      const ekran = kutu(g, 0.1, 2, 2, 0xe5e7eb, 4, 1.6, 0); const nokta = top(g, 0.12, 0xef4444, 3.9, 1.6, 0, { edge: false });
      kart('u23t', '', '#F5C400');
      return { led, kub, isik, laz, isin, ekran, nokta };
    },
    tick(S, dt, o) {
      const l = S.mod === 'led'; o.led.visible = l; o.laz.visible = o.ekran.visible = o.nokta.visible = !l;
      if (l) { const lam = 1240 / S.Eg, c = renkNm(lam); o.kub.material.color.copy(c); o.kub.material.emissive.copy(c).multiplyScalar(0.6); o.isik.color.copy(c);
        FZ.setTag('u23t', `E<sub>g</sub> = ${fs(S.Eg)} eV → λ = ${F('1240', fs(S.Eg))} ≈ ${Math.round(lam)} nm`); FZ.show('u23t', V3(1.6, 3.4, 0), 1); }
      else { FZ.setTag('u23t', 'Lazer: tek renk · eş fazlı · paralel · uyarılmış salma'); FZ.show('u23t', V3(0.5, 3.4, 0), 1); }
    },
    qp: () => V3(0, 4, 0) });
  const d23 = ders(s23, { yk: 'AYT23-d1', no: 1, icon: '🏥', name: 'Hastanede ve cebimizde modern fizik', task: 'Yarı iletken ve LED, lazer, röntgen, MR, PET, güneş pili, süperiletkenlik.', steps: [
    { k: { tur: 'merak', b: 'Telefon ekranındaki renkler, barkod okuyucu, MR cihazı…', m: ['Hepsi kuantum fiziğinin ürünü. Kısa bir gezinti yapalım.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Yarı iletken ve LED', m: ['Yarı iletkende elektronların atlaması gereken bir enerji aralığı (yasak bant, E<sub>g</sub>) vardır.', `LED\'de elektron bu aralığı geçerken foton yayar: ${FM(`λ = ${F('h c', 'E<sub>g</sub>')}`)}`] } },
    { p: { t: 'E<sub>g</sub> değeri büyük olan bir LED hangi renge daha yakın ışık verir?', o: ['Kırmızı', 'Mavi', 'Kızılötesi', 'Fark etmez'], d: 1 } },
    { sub: 'Yasak bant enerjisini artıralım.', go: '▶︎ Artır' },
    { do: S => { S.Eg = 2.7; }, sub: 'LED\'in rengi değişti.', wait: 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Büyük E<sub>g</sub> → kısa λ', f: ['u23t'], m: ['E<sub>g</sub> = 2,7 eV → λ ≈ 460 nm (mavi). Mavi LED\'in icadı 2014 Nobel Fizik Ödülü\'nü getirdi.'] } },
    { x: { b: 'Yasak bant enerjisini değiştir', m: ['LED rengini ayarlayın.'],
      kay: [{ ad: 'Eg', etiket: 'E<sub>g</sub>', min: 1.6, max: 3.2, adim: 0.2, deger: 2.7, birim: 'eV', set: (S, v) => { S.Eg = v; } }],
      olc: S => `λ = ${F('1240', fs(S._Eg))} = <em>${Math.round(1240 / S._Eg)} nm</em>` } },
    { do: S => { S.mod = 'lazer'; }, k: { tur: 'kavram', b: 'Lazer', m: ['Uyarılmış atoma gelen foton, <em>aynı</em> fotondan bir tane daha saldırır (uyarılmış salma).', 'Sonuç: tek renkli, eş fazlı, dağılmayan güçlü ışık. Kullanım: göz ameliyatı, barkod, fiber optik.'] } },
    { k: { tur: 'ornek', b: 'Tıpta görüntüleme', m: ['Röntgen ve BT: X ışını kullanır (iyonlaştırıcı). Tüp gerilimi V ise en kısa dalga boyu λ<sub>min</sub> = hc / (eV).', 'MR: güçlü manyetik alan (süperiletken mıknatıs) + radyo dalgası (iyonlaştırıcı değil). PET: pozitron-elektron yok olması → zıt yönde iki gama ışını.'] } },
    { k: { tur: 'dikkat', b: 'Süperiletkenlik ve güneş pili', m: ['Süperiletken, belirli bir sıcaklığın altında direnci <em>tam sıfır</em> olan maddedir; MR ve hızlı trenlerde (maglev) kullanılır.', 'Güneş pili LED\'in tersidir: foton yasak bandı aşan bir elektron koparır, akım oluşur.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`LED: ${FM(`λ = ${F('hc', 'E<sub>g</sub>')}`)} · lazer: uyarılmış salma · röntgen iyonlaştırıcı, MR değil · süperiletken: R = 0`] } },
  ] });
  const g23 = gorev(s23, { yk: 'AYT23-g1', no: 1, icon: '🔦', name: 'Teknoloji turu', task: 'LED rengi, lazerin özellikleri, röntgen ve MR soruları.', steps: [
    { do: S => { S.mod = 'led'; S.Eg = 2.48; }, sub: 'Bir LED yanıyor.', go: '▶︎ Başlat' },
    { q: { t: 'Yasak bant enerjisi 2,48 eV olan LED\'in yaydığı ışığın dalga boyu kaç nm\'dir?', o: ['500 nm', '620 nm', '400 nm', '248 nm'], f: ['u23t'],
      s: [`${FM(`λ = ${F('h c', 'E<sub>g</sub>')}`)} = ${F('1240', '2,48')} = <em>500 nm</em> ✓ (yeşil)`], n: ['E<sub>g</sub> büyüdükçe dalga boyu küçülür.'] } },
    { do: S => { S.mod = 'lazer'; }, q: { t: 'Aşağıdakilerden hangisi lazer ışığının bir özelliği <b>değildir</b>?', o: ['Birçok farklı dalga boyu içermesi', 'Tek renkli olması', 'Eş fazlı olması', 'Az dağılması'],
      s: ['Lazer ışığı uyarılmış salma ile oluşur: tüm fotonlar aynı enerji ve fazdadır.', '<em>Birçok dalga boyu içermez</em> ✓'], n: ['Ampul ışığı ise birçok dalga boyunu rastgele fazlarla içerir.'] } },
    { q: { t: 'Röntgen tüpünde elektronlar 31 kV ile hızlandırılıyor. Oluşan X ışınının en kısa dalga boyu kaç nm\'dir?', o: ['0,04 nm', '0,4 nm', '40 nm', '4 nm'],
      s: ['Bir elektronun enerjisi en çok 31 000 eV', `λ<sub>min</sub> = ${F('1240', '31 000')} = <em>0,04 nm</em> ✓`], n: ['Elektronun bütün kinetik enerjisi tek bir fotona dönüşürse en kısa dalga boyu oluşur.'] } },
    { q: { t: 'Aşağıdaki görüntüleme yöntemlerinden hangisi iyonlaştırıcı ışınım <b>kullanmaz</b>?', o: ['MR', 'Röntgen', 'Bilgisayarlı tomografi', 'PET'],
      s: ['MR manyetik alan ve radyo dalgası kullanır; radyo dalgası iyonlaştırıcı değildir.', '<em>MR</em> ✓'], n: ['Röntgen ve BT X ışını, PET gama ışını kullanır.'] } },
  ] });
  konuEkle('AYT', 'Modern Fiziğin Uygulamaları', { dersler: [d23], gorevler: [g23] });
})();
