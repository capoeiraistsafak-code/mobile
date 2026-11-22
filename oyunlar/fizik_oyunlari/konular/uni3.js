// ÜNİVERSİTE · Özel Görelilik — Dalga–Parçacık İkiliği — Belirsizlik İlkesi — Hidrojen Atomu ve Spin
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };
  const gam = b => 1 / Math.sqrt(1 - b * b);

  // =====================================================================
  // ÖZEL GÖRELİLİK — ışık saati: perondaki saat ve trendeki saat (görselde c = 2 birim/s)
  // =====================================================================
  const C = 2, H = 2; // ayna aralığı
  const sOG = sahne({ icon: '🚀', cam: [[1.6, 4.5, 13], [1.6, 2, 0]], plate: [16, 5, 0, 0],
    data: [['Işık saati', 'aynalar arası gidiş-dönüş = 1 tık'], ['c', '3 · 10⁸ m/s']],
    S0: () => ({ b: 0.6, kos: 0, tt: 0, x: -6 }),
    kur(g) {
      const per = new THREE.Group(); per.position.set(-6.5, 0, 0); g.add(per);
      kutu(per, 1.2, 0.1, 0.8, 0x64748b, 0, 0.4, 0); kutu(per, 1.2, 0.1, 0.8, 0x64748b, 0, 0.4 + H, 0); const f1 = top(per, 0.12, 0xfacc15, 0, 0.5, 0, { edge: false });
      const tren = new THREE.Group(); g.add(tren);
      const govde = kutu(tren, 2.6, 2.6, 1.4, 0x3b82f6, 0, 1.6, -0.9, { op: 0.35 });
      kutu(tren, 2.8, 0.14, 1.5, 0x1f2937, 0, 0.27, -0.9); kutu(tren, 2.7, 0.12, 1.5, 0x1e3a8a, 0, 2.96, -0.9);   // şasi ve tavan
      [-0.9, 0.9].forEach(x => [-1.6, -0.2].forEach(z => { const t = silindir(tren, 0.18, 0.18, 0.08, 0x374151, x, 0.18, z, { edge: false }); t.rotation.x = Math.PI / 2; }));   // tekerlekler
      FZ.ray(g, 16, 0, -0.9);
      kutu(tren, 1.2, 0.1, 0.8, 0x64748b, 0, 0.4, 0); kutu(tren, 1.2, 0.1, 0.8, 0x64748b, 0, 0.4 + H, 0);
      const f2 = top(g, 0.12, 0xfacc15, 0, 0.5, 0, { edge: false }), iz = duz(g, 0xf59e0b);
      kart('og1', '', '#475569'); kart('og2', '', '#2563eb'); kart('ogt', '', '#F5C400'); etiket('ogv', 'v', '#16a34a');
      return { per, f1, tren, govde, f2, iz, ov: ok(0x22c55e, 'ogv') };
    },
    tick(S, dt, o) {
      const g_ = gam(S.b); if (S.kos) { S.tt += dt; S.x += S.b * C * dt; if (S.x > 6) { S.x = -2; } }
      const yarim = H / C; // durgun saatte tek yön süresi
      const ph1 = (S.tt / yarim) % 2, y1 = ph1 < 1 ? ph1 : 2 - ph1; o.f1.position.y = 0.5 + y1 * (H - 0.2);
      const ph2 = (S.tt / (yarim * g_)) % 2, y2 = ph2 < 1 ? ph2 : 2 - ph2;
      o.tren.position.x = S.x; o.tren.scale.x = 1 / g_; // uzunluk büzülmesi (hareket yönünde)
      o.f2.position.set(S.x, 0.5 + y2 * (H - 0.2), 0);
      const pts = []; for (let i = 0; i <= 60; i++) { const t = S.tt - i * 0.05; if (t < 0) break; const ph = (t / (yarim * g_)) % 2, yy = ph < 1 ? ph : 2 - ph; const x = S.x - i * 0.05 * S.b * C; if (x < -6) break; pts.push(V3(x, 0.5 + yy * (H - 0.2), 0)); }
      if (pts.length > 1) FZ.setLine(o.iz, pts); else o.iz.visible = false;
      if (S.b > 0) { FZ.setArrow(o.ov, V3(S.x - 0.5, 3.3, 0), V3(1, 0, 0), S.b * 2); FZ.show('ogv', V3(S.x + S.b * 2 - 0.2, 3.3, 0), 1); }
      const tik1 = Math.floor(S.tt / (2 * yarim)), tik2 = Math.floor(S.tt / (2 * yarim * g_));
      FZ.setTag('og1', `Peron saati: ${tik1} tık`); FZ.show('og1', V3(-6.5, 3, 0), 1);
      FZ.setTag('og2', `Trendeki saat: ${tik2} tık`); FZ.show('og2', V3(S.x, 4, 0), 1);
      FZ.setTag('ogt', `v = ${fs(S.b)} c · γ = ${F('1', SQ('1 − v²/c²'))} = ${fs(g_)}`); FZ.show('ogt', V3(-1.5, 4.9, 0), 1);
    },
    qp: () => V3(-1.5, 5.5, 0) });
  const dOG = ders(sOG, { yk: 'UNI1-d1', no: 1, icon: '🛰️', name: 'GPS neden Einstein\'a muhtaç?', task: 'Einstein\'ın iki ilkesi, zaman genişlemesi, uzunluk büzülmesi, kütle-enerji eşdeğerliği.', steps: [
    { k: { tur: 'merak', b: 'GPS uydularının saatleri her gün düzeltilmeseydi konumunuz günde ~10 km kayardı', m: ['Sebep: hızla hareket eden saatler yavaş işler. Bu bir bozukluk değil, zamanın kendi özelliği.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Einstein\'ın iki ilkesi (1905)', m: ['1) Fizik yasaları bütün eylemsiz gözlemciler için aynıdır.', '2) Işığın boşluktaki hızı c, kaynağın ve gözlemcinin hızından bağımsız olarak herkes için aynıdır.'] } },
    { p: { t: 'Tren 0,6 c ile giderken perondaki gözlemciye göre trendeki ışık saati nasıl işler?', o: ['Daha hızlı', 'Daha yavaş', 'Aynı hızda', 'Durur'], d: 1 } },
    { sub: 'Treni hareket ettirelim (görüntü yavaşlatıldı: c = 2 birim/s).', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Trendeki ışık daha uzun, eğik yol izliyor…', wait: 8 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Zaman genişlemesi', f: ['og1', 'og2', 'ogt'], m: ['Perondan bakınca trendeki ışık eğik (daha uzun) yol alır ama hızı yine c\'dir → bir tık daha uzun sürer.', `${FM('Δt = γ Δt<sub>0</sub>')} · ${FM(`γ = ${F('1', SQ(`1 − ${F('v<sup>2</sup>', 'c<sup>2</sup>')}`))}`)} · v = 0,6c → γ = 1,25`] } },
    { k: { tur: 'kavram', b: 'Uzunluk büzülmesi', m: [`${FM(`L = ${F('L<sub>0</sub>', 'γ')}`)} · yalnız <em>hareket doğrultusunda</em> kısalır (tren 1,25 kat kısa görünüyor).`, 'L₀ ve Δt₀ "öz" büyüklüklerdir: cisimle birlikte hareket eden gözlemcinin ölçtüğü değerler.'] } },
    { x: { b: 'Hızı değiştir', m: ['γ ne zaman belirgin büyüyor?'],
      kay: [{ ad: 'b', etiket: 'v', min: 0, max: 0.95, adim: 0.05, deger: 0.6, birim: 'c', set: (S, v) => { S.b = v; } }],
      olc: S => `γ = <em>${fs(gam(S._b))}</em> · 1 saatlik yolculuk peronda ${fs(gam(S._b))} saat · tren boyu %${Math.round(100 / gam(S._b))}` } },
    { do: S => { S.b = 0.6; S._b = 0.6; }, k: { tur: 'kavram', b: 'Kütle-enerji', m: [`Durgun cismin enerjisi: ${FM('E<sub>0</sub> = m c<sup>2</sup>')} · toplam enerji ${FM('E = γ m c<sup>2</sup>')}`, 'Kütleli hiçbir cisim c\'ye ulaşamaz: v → c iken γ → ∞ olur.'] } },
    { k: { tur: 'dikkat', b: 'Görelilik "her şey görecelidir" demek değil', m: ['Işık hızı ve fizik yasaları herkes için <em>aynıdır</em>; süre ve uzunluk ise gözlemciye göre değişir.', 'Günlük hızlarda γ ≈ 1: 300 m/s\'lik uçakta fark milyarda birden küçük.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`γ = ${F('1', SQ('1 − v²/c²'))}`)} · ${FM('Δt = γ Δt<sub>0</sub>')} · ${FM(`L = ${F('L<sub>0</sub>', 'γ')}`)} · ${FM('E<sub>0</sub> = mc<sup>2</sup>')}`] } },
  ] });
  const gOG = gorev(sOG, { yk: 'UNI1-g1', no: 1, icon: '🚀', name: 'Işık hızına yakın', task: 'Lorentz çarpanı, zaman genişlemesi, uzunluk büzülmesi ve E = mc².', data: [['c', '3 · 10⁸ m/s']], steps: [
    { do: S => { S.b = 0.6; }, sub: 'Uzay treni yola çıkıyor.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'v = 0,6 c için Lorentz çarpanı γ kaçtır?', o: ['1,25', '0,8', '1,6', '0,6'], f: ['ogt'],
      s: [`${F('v<sup>2</sup>', 'c<sup>2</sup>')} = 0,36 → ${SQ('1 − 0,36')} = ${SQ('0,64')} = 0,8`, `γ = ${F('1', '0,8')} = <em>1,25</em> ✓`], n: ['γ her zaman 1\'den büyük ya da eşittir.'] } },
    { q: { t: '0,6 c ile giden gemideki astronotun saatine göre yolculuk 8 yıl sürüyor. Dünya\'daki gözlemciye göre kaç yıl sürer?', o: ['10 yıl', '6,4 yıl', '8 yıl', '13,3 yıl'], f: ['og1', 'og2'],
      s: ['Astronotun saati öz zamandır: Δt₀ = 8 yıl', `${FM('Δt = γ Δt<sub>0</sub>')} = 1,25 · 8 = <em>10 yıl</em> ✓`], n: ['Hareketli saat yavaş işler; Dünya\'dan ölçülen süre uzundur.'] } },
    { do: S => { S.b = 0.8; }, q: { t: 'Durgunken 100 m olan uzay gemisi 0,8 c ile geçerken Dünya\'dan kaç m ölçülür?', o: ['60 m', '100 m', '167 m', '80 m'], f: ['ogt'],
      s: ['v = 0,8c → γ = 1/0,6', `${FM(`L = ${F('L<sub>0</sub>', 'γ')}`)} = 100 · 0,6 = <em>60 m</em> ✓`], n: ['Gemideki astronot kendi gemisini yine 100 m ölçer.'] } },
    { q: { t: '1 g kütlenin durgun kütle enerjisi kaç J\'dür?', o: ['9 · 10<sup>13</sup> J', '3 · 10<sup>5</sup> J', '9 · 10<sup>16</sup> J', '3 · 10<sup>8</sup> J'],
      s: [`${FM('E<sub>0</sub> = m c<sup>2</sup>')} = 10<sup>−3</sup> · (3 · 10<sup>8</sup>)<sup>2</sup>`, '= <em>9 · 10<sup>13</sup> J</em> ✓'], n: ['Bu, yaklaşık 20 bin ton TNT\'nin enerjisidir. Kütleyi kilograma çevirmeyi unutmayın.'] } },
  ] });
  konuEkle('UNI', 'Özel Görelilik', { dersler: [dOG], gorevler: [gOG] });

  // =====================================================================
  // DALGA–PARÇACIK İKİLİĞİ — Compton saçılması (λ_C = 2,43 pm)
  // =====================================================================
  const LC = 2.43;
  const sDP = sahne({ icon: '🎱', cam: [[1.8, 7, 8], [1.8, 0, 0]], plate: [12, 9, 0, 0],
    data: [['Gelen foton', 'λ = 20 pm (X ışını)'], ['h/(m<sub>e</sub>c)', '2,43 pm']],
    S0: () => ({ th: 90, faz: 0, kos: 0, lam: 20 }),
    kur(g) {
      const e = top(g, 0.25, 0xef4444, 0, 0.4, 0), gel = duz(g, 0x7c3aed), sac = duz(g, 0xdc2626);
      etiket('cpe', 'e⁻', '#dc2626'); etiket('cpth', 'θ', '#334155'); kart('cpt', '', '#F5C400'); etiket('cpg', 'λ', '#7c3aed'); etiket('cps', 'λ′', '#dc2626');
      return { e, gel, sac, oe: ok(0xef4444, 'cpe') };
    },
    tick(S, dt, o) {
      if (S.kos) S.faz = Math.min(2, S.faz + dt * 0.6);
      const th = S.th * Math.PI / 180, lp = S.lam + LC * (1 - Math.cos(th));
      const dalga = (a, b, lam, s0, s1) => { const d = b.clone().sub(a), L = d.length(), n = d.clone().normalize(), yan = V3(-n.z, 0, n.x), pts = [];
        for (let i = 0; i <= 160; i++) { const s = i / 160 * L; if (s < s0 * L || s > s1 * L) continue; pts.push(a.clone().add(n.clone().multiplyScalar(s)).add(yan.clone().multiplyScalar(0.18 * Math.sin(s / (lam / 20 * 0.35) * Math.PI * 2 - S.t * 6))).setY(0.4)); } return pts; };
      const A = V3(-5.5, 0.4, 0), O = V3(0, 0.4, 0), B = V3(5 * Math.cos(th), 0.4, -5 * Math.sin(th));
      const f1 = Math.min(1, S.faz), f2 = Math.max(0, S.faz - 1);
      const p1 = dalga(A, O, S.lam, 0, f1); if (p1.length > 1) FZ.setLine(o.gel, p1); else o.gel.visible = false;
      const p2 = dalga(O, B, lp, 0, f2); if (p2.length > 1) FZ.setLine(o.sac, p2); else o.sac.visible = false;
      // momentum korunumu: p_e = p_gel − p_saç (yön)
      const pg = V3(1 / S.lam, 0, 0), ps = V3(Math.cos(th) / lp, 0, -Math.sin(th) / lp), pe = pg.clone().sub(ps);
      if (f2 > 0) { o.e.position.copy(O.clone().add(pe.clone().normalize().multiplyScalar(f2 * 2.5))); FZ.setArrow(o.oe, o.e.position, pe, pe.length() * 30); }
      else o.e.position.copy(O);
      FZ.show('cpe', o.e.position.clone().add(V3(0, 0.6, 0)), 1); FZ.show('cpth', V3(1.2 * Math.cos(th / 2), 0.4, -1.2 * Math.sin(th / 2)), f2 > 0 ? 1 : 0);
      FZ.show('cpg', V3(-3, 0.4, 0.6), 1); FZ.show('cps', B.clone().multiplyScalar(0.6).add(V3(0.4, 0, 0)), f2 > 0 ? 1 : 0);
      FZ.setTag('cpt', `θ = ${S.th}° · Δλ = 2,43 (1 − cos θ) = ${fs(lp - S.lam)} pm<br>λ′ = ${fs(lp)} pm`); FZ.show('cpt', V3(-3.4, 0.4, -3.6), 1);
    },
    qp: () => V3(0, 2, 0) });
  const dDP = ders(sDP, { yk: 'UNI5-d1', no: 1, icon: '🎱', name: 'Işık bilardo topu gibi çarpışabilir mi?', task: 'Fotonun momentumu, Compton saçılması, de Broglie dalga boyu, Davisson–Germer, tamamlayıcılık.', steps: [
    { k: { tur: 'merak', b: '1923: Compton X ışınlarını elektronlara gönderdi', m: ['Saçılan X ışınlarının dalga boyu <em>uzamıştı</em>. Klasik dalga kuramı bunu açıklayamıyordu.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Fotonun momentumu', m: [`Kütlesi olmasa da foton momentum taşır: ${FM(`p = ${F('h', 'λ')}`)} · ${FM(`E = ${F('h c', 'λ')}`)}`] } },
    { p: { t: 'Foton duran bir elektrona çarpıp saçılırsa saçılan fotonun dalga boyu ne olur?', o: ['Kısalır', 'Uzar', 'Değişmez', 'Sıfır olur'], d: 1 } },
    { sub: 'Fotonu gönderelim.', go: '▶︎ Gönder' },
    { do: S => { S.kos = 1; }, sub: 'Çarpışma…', until: S => S.faz >= 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Foton enerji ve momentum verdi', f: ['cpt', 'cps'], m: ['Elektron geri teper (mavi ok); foton enerji kaybeder → λ uzar.', `${FM(`Δλ = ${F('h', 'm<sub>e</sub> c')} (1 − cos θ)`)} · h/(m<sub>e</sub>c) = 2,43 pm (Compton dalga boyu)`] } },
    { x: { b: 'Saçılma açısını değiştir', m: ['Hangi açıda kayma en büyük?'],
      kay: [{ ad: 'th', etiket: 'θ', min: 0, max: 180, adim: 30, deger: 90, birim: '°', set: (S, v) => { S.th = v; } }],
      olc: S => `Δλ = 2,43 · (1 − cos ${S._th}°) = <em>${fs(LC * (1 - Math.cos(S._th * Math.PI / 180)))} pm</em><br>En büyük kayma 180°\'de (geri saçılma): 4,86 pm.` } },
    { do: S => { S.th = 90; S._th = 90; }, k: { tur: 'kavram', b: 'Madde dalgaları: de Broglie', m: [`Işık parçacık gibi davranıyorsa, parçacıklar da dalga gibi davranmalı: ${FM(`λ = ${F('h', 'p')} = ${F('h', 'm v')}`)}`, '1927 Davisson–Germer: elektronlar nikel kristalinden X ışınları gibi kırınıma uğradı.'] } },
    { k: { tur: 'dikkat', b: 'Tamamlayıcılık', m: ['Bir deney ya dalga yönünü (girişim) ya parçacık yönünü (çarpışma) gösterir; ikisi aynı anda gözlenmez (Bohr).', 'Günlük cisimlerin dalga boyu ölçülemeyecek kadar küçüktür: 0,15 kg, 40 m/s top için λ ≈ 10⁻³⁴ m.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`p = ${F('h', 'λ')}`)} · ${FM(`Δλ = ${F('h', 'm<sub>e</sub>c')} (1 − cos θ)`)} · ${FM(`λ = ${F('h', 'mv')}`)}`] } },
  ] });
  const gDP = gorev(sDP, { yk: 'UNI5-g1', no: 1, icon: '⚛️', name: 'Compton deneyi', task: 'Compton kayması, foton momentumu ve elektronun de Broglie dalga boyu.', data: [['h', '6,63 · 10⁻³⁴ J·s'], ['h/(m<sub>e</sub>c)', '2,43 pm']], steps: [
    { do: S => { S.th = 90; }, sub: 'X ışını fotonu duran elektrona gönderiliyor.', go: '▶︎ Gönder' },
    { do: S => { S.kos = 1; }, q: { t: 'Foton 90° saçılırsa dalga boyu kaç pm artar?', o: ['2,43 pm', '0', '4,86 pm', '1,21 pm'], f: ['cpt'],
      s: [`Δλ = 2,43 · (1 − cos 90°) = 2,43 · (1 − 0) = <em>2,43 pm</em> ✓`], n: ['Kayma gelen dalga boyuna bağlı değildir; yalnız açıya bağlıdır.'] } },
    { do: S => { S.th = 180; S.faz = 0; }, q: { t: 'Foton geri saçılırsa (θ = 180°) dalga boyundaki artış kaç pm\'dir?', o: ['4,86 pm', '2,43 pm', '0', '1,21 pm'], f: ['cpt'],
      s: [`cos 180° = −1 → Δλ = 2,43 · 2 = <em>4,86 pm</em> ✓`], n: ['Kafa kafaya çarpışmada elektron en çok enerjiyi alır.'] } },
    { q: { t: 'Dalga boyu 1 nm olan fotonun momentumu kaç kg·m/s\'dir?', o: ['6,63 · 10<sup>−25</sup>', '6,63 · 10<sup>−34</sup>', '6,63 · 10<sup>−43</sup>', '1,99 · 10<sup>−16</sup>'],
      s: [`${FM(`p = ${F('h', 'λ')}`)} = ${F('6,63 · 10<sup>−34</sup>', '10<sup>−9</sup>')} = <em>6,63 · 10<sup>−25</sup> kg·m/s</em> ✓`], n: ['1,99 · 10⁻¹⁶ J ise bu fotonun enerjisidir (E = hc/λ).'] } },
    { q: { t: 'Bir elektronun hızı iki katına çıkarsa (v ≪ c) de Broglie dalga boyu ne olur?', o: ['Yarıya iner', 'İki katına çıkar', 'Değişmez', 'Dörtte birine iner'],
      s: [`${FM(`λ = ${F('h', 'm v')}`)} → v 2 katı → <em>λ yarıya iner</em> ✓`], n: ['Elektron mikroskopları bu yüzden yüksek gerilimle hızlandırılmış elektron kullanır.'] } },
  ] });
  konuEkle('UNI', 'Dalga–Parçacık İkiliği', { dersler: [dDP], gorevler: [gDP] });

  // =====================================================================
  // BELİRSİZLİK İLKESİ — dalga paketi genişliği (Δx) ve momentum dağılımı (Δp)
  // =====================================================================
  const sBI = sahne({ icon: '〽️', cam: [[1.6, 3.5, 11], [1.6, 2.2, 0]], plate: [12, 4, 0, 0],
    data: [['ħ', '1,055 · 10⁻³⁴ J·s'], ['Elektron kütlesi', '9,11 · 10⁻³¹ kg']],
    S0: () => ({ sx: 1 }),
    kur(g) {
      const psi = duz(g, 0x2563eb), zarf = duz(g, 0x94a3b8), p = duz(g, 0xdc2626), e1 = duz(g, 0x64748b), e2 = duz(g, 0x64748b);
      FZ.setLine(e1, [V3(-5.5, 1.2, 0), V3(1.5, 1.2, 0)]); FZ.setLine(e2, [V3(2.5, 1.2, 0), V3(6, 1.2, 0)]);
      kart('bx', 'konum: ψ(x)', '#2563eb'); kart('bp', 'momentum dağılımı', '#dc2626'); kart('bt', '', '#F5C400');
      return { psi, zarf, p, e1, e2 };
    },
    tick(S, dt, o) {
      const s = S.sx, k0 = 5, pts = [], z = [];
      for (let i = 0; i <= 240; i++) { const x = -3.5 + i / 240 * 7, en = Math.exp(-x * x / (4 * s * s)); pts.push(V3(x - 0.5, 1.2 + 1.4 * en * Math.cos(k0 * x - S.t * 4), 0)); z.push(V3(x - 0.5, 1.2 + 1.4 * en, -0.05)); }
      FZ.setLine(o.psi, pts.filter(p => p.x > -5.5 && p.x < 1.5)); FZ.setLine(o.zarf, z.filter(p => p.x > -5.5 && p.x < 1.5));
      const sp = 1 / (2 * s), pp = []; for (let i = 0; i <= 120; i++) { const q = -1.75 + i / 120 * 3.5; pp.push(V3(4.25 + q, 1.2 + 2.4 * Math.exp(-q * q / (2 * sp * sp * 4)) * Math.min(1, 0.6 / sp), 0)); }
      FZ.setLine(o.p, pp);
      FZ.show('bx', V3(-2, 3.3, 0), 1); FZ.show('bp', V3(4.25, 4, 0), 1);
      FZ.setTag('bt', `Δx = ${fs(s)} birim · Δp = ${fs(sp)} birim · Δx · Δp = ${fs(s * sp)} (= ħ/2)`); FZ.show('bt', V3(0.5, 4.8, 0), 1);
    },
    qp: () => V3(0.5, 5.3, 0) });
  const dBI = ders(sBI, { yk: 'UNI6-d1', no: 1, icon: '🎯', name: 'Elektron neden çekirdeğe düşmez?', task: 'Dalga paketi, Heisenberg belirsizlik ilkesi, enerji-zaman belirsizliği, atomun kararlılığı.', steps: [
    { k: { tur: 'merak', b: 'Klasik fiziğe göre elektron ışıma yapıp çekirdeğe düşmeliydi', m: ['Düşmüyor. Çünkü çekirdeğe sıkıştırılan elektronun momentumu (ve enerjisi) büyür: belirsizlik ilkesi.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Dalga paketi', f: ['bx', 'bp'], m: ['Bir parçacığı bir bölgede bulmak için farklı dalga boylarındaki dalgaları üst üste koymak gerekir.', 'Paket ne kadar dar olursa o kadar çok farklı dalga boyu (momentum) gerekir.'] } },
    { p: { t: 'Parçacığın konumunu daha kesin belirlersek (paketi daraltırsak) momentum dağılımı ne olur?', o: ['Daralır', 'Genişler', 'Değişmez', 'Sıfır olur'], d: 1 } },
    { sub: 'Paketi daraltalım: Δx 1 → 0,4.', go: '▶︎ Daralt' },
    { do: S => { S.sx = 0.4; }, sub: 'Kırmızı eğriye bakın.', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Heisenberg belirsizlik ilkesi', f: ['bt'], m: [`${FM(`Δx · Δp ≥ ${F('ħ', '2')}`)} · ħ = ${F('h', '2π')}`, 'Konum ve momentum aynı anda istenen kesinlikte bilinemez. Biri daralınca öbürü genişler.'] } },
    { x: { b: 'Paket genişliğini değiştir', m: ['Çarpım Δx · Δp hep aynı kalıyor mu?'],
      kay: [{ ad: 'sx', etiket: 'Δx', min: 0.3, max: 1.5, adim: 0.1, deger: 0.4, birim: '', set: (S, v) => { S.sx = v; } }],
      olc: S => `Δx = ${fs(S._sx)} · Δp = ${fs(1 / (2 * S._sx))} → çarpım = <em>0,5</em> (Gauss paketi en küçük çarpımı verir)` } },
    { do: S => { S.sx = 1; S._sx = 1; }, k: { tur: 'ornek', b: 'Atomdaki elektron', m: ['Δx ≈ 0,1 nm → Δp ≥ ħ/(2Δx) ≈ 5,3 · 10⁻²⁵ kg·m/s → Δv ≈ 5,8 · 10⁵ m/s!', '0,15 kg\'lık top, Δx = 1 μm → Δv ≈ 3,5 · 10⁻²⁸ m/s: günlük hayatta fark edilmez.'] } },
    { k: { tur: 'dikkat', b: 'Ölçüm aletinin kusuru değil', m: ['Sık yanlış: "Daha iyi aletle ikisi de kesin ölçülür."', 'Belirsizlik doğanın dalga yapısından gelir; parçacığın kesin konumu ve momentumu <em>birlikte</em> yoktur.', `Enerji-zaman: ${FM(`ΔE · Δt ≥ ${F('ħ', '2')}`)} (kısa ömürlü durumların enerjisi bulanıktır).`] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`Δx · Δp ≥ ${F('ħ', '2')}`)} · ${FM(`ΔE · Δt ≥ ${F('ħ', '2')}`)} · dar paket ↔ geniş momentum dağılımı`] } },
  ] });
  const gBI = gorev(sBI, { yk: 'UNI6-g1', no: 1, icon: '🎯', name: 'Belirsizliği hesapla', task: 'Belirsizlik ilkesiyle en küçük momentum ve hız belirsizliği.', data: [['ħ', '1,055 · 10⁻³⁴ J·s'], ['m<sub>e</sub>', '9,11 · 10⁻³¹ kg']], steps: [
    { do: S => { S.sx = 1; }, sub: 'Elektronun dalga paketi.', go: '▶︎ Başlat' },
    { do: S => { S.sx = 0.5; }, q: { t: 'Konum belirsizliği yarıya indirilirse en küçük momentum belirsizliği ne olur?', o: ['İki katına çıkar', 'Yarıya iner', 'Değişmez', 'Dört katına çıkar'], f: ['bt'],
      s: [`Δp<sub>min</sub> = ${F('ħ', '2 Δx')} → Δx yarı → <em>Δp iki katı</em> ✓`], n: ['Çarpım sabit kalır; biri küçülünce diğeri aynı oranda büyür.'] } },
    { q: { t: 'Bir elektron Δx = 1 · 10⁻¹⁰ m içinde bulunuyor. En küçük momentum belirsizliği yaklaşık kaç kg·m/s\'dir?', o: ['5,3 · 10<sup>−25</sup>', '1,1 · 10<sup>−24</sup>', '5,3 · 10<sup>−35</sup>', '1,1 · 10<sup>−44</sup>'],
      s: [`Δp = ${F('ħ', '2 Δx')} = ${F('1,055 · 10<sup>−34</sup>', '2 · 10<sup>−10</sup>')}`, '≈ <em>5,3 · 10<sup>−25</sup> kg·m/s</em> ✓'], n: ['1,1 · 10⁻²⁴ bulduysanız 2\'ye bölmeyi unuttunuz.'] } },
    { q: { t: 'Aynı elektronun hız belirsizliği yaklaşık kaç m/s\'dir?', o: ['5,8 · 10<sup>5</sup>', '5,8 · 10<sup>−5</sup>', '4,8 · 10<sup>−55</sup>', '1,7 · 10<sup>6</sup>'],
      s: [`Δv = ${F('Δp', 'm')} = ${F('5,3 · 10<sup>−25</sup>', '9,11 · 10<sup>−31</sup>')}`, '≈ <em>5,8 · 10<sup>5</sup> m/s</em> ✓'], n: ['Bu, elektronun atomdaki tipik hızıyla aynı mertebededir.'] } },
    { q: { t: 'Belirsizlik ilkesi neden bir futbol topunun hareketinde fark edilmez?', o: ['Kütlesi çok büyük olduğu için Δv ölçülemeyecek kadar küçük kalır', 'Top dalga gibi davranmadığı için ilke geçersizdir', 'Top yavaş olduğu için', 'Topun konumu ölçülemediği için'],
      s: ['Δv = ħ/(2 m Δx): m büyükse Δv ihmal edilecek kadar küçük olur.', '<em>Kütle büyük</em> ✓ (ilke yine geçerlidir)'], n: ['Kuantum etkileri kütle küçüldükçe belirginleşir.'] } },
  ] });
  konuEkle('UNI', 'Belirsizlik İlkesi', { dersler: [dBI], gorevler: [gBI] });

  // =====================================================================
  // HİDROJEN ATOMU VE SPİN — Stern–Gerlach deneyi
  // =====================================================================
  const sSG = sahne({ icon: '🧭', cam: [[1.6, 6, 9], [1.6, 0.8, 0]], plate: [13, 6, 0, 0],
    data: [['Atom', 'gümüş (tek dış elektron)'], ['Alan', 'düzgün olmayan (gradyanlı)']],
    S0: () => ({ mod: 'kuant', say: 0, zam: 0, kos: 0, n: 2 }),
    kur(g) {
      kutu(g, 1, 1, 1, 0x7c2d12, -5.5, 0.9, 0);
      const N = FZ.mesh(new THREE.CylinderGeometry(0.1, 0.6, 1, 4), 0xef4444); N.position.set(-0.5, 2.1, 0); N.rotation.y = Math.PI / 4; g.add(N);
      kutu(g, 2.5, 0.4, 1.2, 0x3b82f6, -0.5, -0.05, 0); kutu(g, 2.5, 0.4, 1.2, 0xef4444, -0.5, 2.55, 0);
      const perde = kutu(g, 0.1, 3, 2, 0xf8fafc, 5, 0.9, 0);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(1500 * 3), 3)); geo.setDrawRange(0, 0);
      const nk = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xdc2626, size: 0.07 })); nk.frustumCulled = false; g.add(nk);
      const isin = []; for (let i = 0; i < 20; i++) isin.push(top(g, 0.07, 0xef4444, 0, -5, 0, { edge: false }));
      kart('sgN', 'N', '#dc2626'); kart('sgS', 'S', '#2563eb'); kart('sgt', '', '#F5C400'); kart('sgf', 'Fırın', '#7c2d12');
      return { nk, isin, hiz: [] };
    },
    tick(S, dt, o) {
      if (S.kos) { S.zam += dt * 20; while (S.zam > 1) { S.zam -= 1; const mz = S.mod === 'kuant' ? (Math.random() < 0.5 ? 1 : -1) : (Math.random() * 2 - 1); o.hiz.push({ x: -5, mz, z: (Math.random() - 0.5) * 0.3 }); } }
      o.hiz.forEach(h => h.x += dt * 4); const pos = o.nk.geometry.attributes.position;
      o.hiz = o.hiz.filter(h => { if (h.x >= 4.95) { if (S.say < 1500) { pos.setXYZ(S.say, 4.94, 0.9 + h.mz * 0.9 + (Math.random() - 0.5) * 0.12, h.z * 3); S.say++; } return false; } return true; });
      pos.needsUpdate = true; o.nk.geometry.setDrawRange(0, S.say);
      o.isin.forEach((m, i) => { const h = o.hiz[o.hiz.length - 1 - i]; if (!h) { m.visible = false; return; } m.visible = true; const sap = h.x < -1.75 ? 0 : h.x < 0.75 ? ((h.x + 1.75) / 2.5) ** 2 * 0.25 : 0.25 + (h.x - 0.75) / 4.2 * 0.65; m.position.set(h.x, 0.9 + h.mz * sap, h.z); });
      FZ.show('sgN', V3(-0.5, 3.1, 0), 1); FZ.show('sgS', V3(-0.5, -0.5, 0.8), 1); FZ.show('sgf', V3(-5.5, 1.8, 0), 1);
      FZ.setTag('sgt', S.mod === 'kuant' ? `Gerçek sonuç: iki leke (m<sub>s</sub> = +½, −½) · ${S.say} atom` : `Klasik beklenti: sürekli şerit · ${S.say} atom`); FZ.show('sgt', V3(1.5, 3.8, 0), 1);
    },
    qp: () => V3(1.5, 4.3, 0) });
  const dSG = ders(sSG, { yk: 'UNI9-d1', no: 1, icon: '🧭', name: 'Elektronun içindeki pusula', task: 'Hidrojen atomunun kuantum sayıları (n, l, m<sub>l</sub>), spin, Stern–Gerlach deneyi, Pauli ilkesi.', steps: [
    { k: { tur: 'merak', b: 'MR cihazı vücudunuzdaki hidrojen atomlarının "pusulalarını" okur', m: ['Bu pusulanın adı spin. Ama ilk keşfedildiğinde herkesi şaşırtan bir özelliği vardı.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Hidrojenin kuantum sayıları', m: [`Schrödinger çözümü üç sayı verir: n = 1, 2, … · l = 0 … n − 1 · m<sub>l</sub> = −l … +l`, `Enerji yalnız n\'ye bağlıdır: ${FM(`E<sub>n</sub> = − ${F('13,6 eV', 'n<sup>2</sup>')}`)}`] } },
    { do: S => { S.mod = 'klasik'; S.say = 0; }, sub: 'Klasik fiziğe göre beklenti: pusulalar rastgele yönlü → perdede sürekli şerit.', go: '▶︎ Klasik beklenti' },
    { do: S => { S.kos = 1; }, sub: 'Klasik model…', until: S => S.say >= 600 },
    { do: S => { S.kos = 0; }, p: { t: '1922: Stern ve Gerlach gümüş atomlarını gradyanlı manyetik alandan geçirdi. Perdede ne gördüler?', o: ['Sürekli bir şerit', 'Yalnız iki ayrı leke', 'Tek bir leke', 'Hiç atom ulaşmadı'], d: 1 } },
    { do: S => { S.mod = 'kuant'; S.say = 0; S.kos = 1; }, sub: 'Gerçek deney…', until: S => S.say >= 700 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Spin kuantumludur', f: ['sgt'], m: ['Elektronun manyetik momenti yalnız iki yönde ölçülür: yukarı (+½) ya da aşağı (−½).', `Spin kuantum sayısı ${FM(`s = ${F('1', '2')}`)} · ${FM(`m<sub>s</sub> = ± ${F('1', '2')}`)}`] } },
    { x: { b: 'Kabuk sayısını değiştir', m: ['Bir kabukta kaç farklı durum (orbital × spin) var?'],
      kay: [{ ad: 'n', etiket: 'n', min: 1, max: 4, adim: 1, deger: 2, birim: '', set: (S, v) => { S.n = v; } }],
      olc: S => { const n = S._n; let l = []; for (let i = 0; i < n; i++) l.push(`l=${i}: ${2 * i + 1}`); return `${l.join(' · ')} orbital<br>Toplam: ${n}² = ${n * n} orbital × 2 spin = <em>${2 * n * n} durum</em>`; } } },
    { k: { tur: 'dikkat', b: 'Spin gerçek bir dönme değildir', m: ['Elektronu dönen bir top gibi düşünürsek yüzeyi ışıktan hızlı dönmesi gerekirdi.', 'Spin, kütle ve yük gibi parçacığın <em>doğuştan</em> kuantum özelliğidir. Pauli ilkesi: iki elektron dört kuantum sayısında birden aynı olamaz → periyodik tablo.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['n, l, m<sub>l</sub>, m<sub>s</sub> · n. kabukta 2n² durum · spin ±½, iki leke · Pauli ilkesi'] } },
  ] });
  const gSG = gorev(sSG, { yk: 'UNI9-g1', no: 1, icon: '🧲', name: 'Kuantum sayıları', task: 'Hidrojen atomunda kuantum sayıları ve Stern–Gerlach soruları.', steps: [
    { do: S => { S.mod = 'kuant'; S.say = 0; S.kos = 1; }, sub: 'Gümüş atomu demeti mıknatıstan geçiyor.', go: '▶︎ Başlat' },
    { q: { t: 'Spin dahil, hidrojenin n = 2 kabuğunda kaç farklı elektron durumu vardır?', o: ['8', '4', '2', '6'],
      s: ['l = 0 (1 orbital) + l = 1 (3 orbital) = 4 orbital', 'Her orbitalde 2 spin → <em>2n² = 8</em> ✓'], n: ['Periyodik tablonun 2. sırasında 8 element olması bu yüzdendir.'] } },
    { q: { t: 'n = 3 için açısal momentum kuantum sayısı l hangi değerleri alabilir?', o: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', 'Yalnız 3'],
      s: ['l = 0, 1, …, n − 1', 'n = 3 → <em>0, 1, 2</em> ✓ (s, p, d)'], n: ['l, n\'ye eşit olamaz.'] } },
    { q: { t: 'l = 2 (d orbitali) için m<sub>l</sub> kaç farklı değer alır?', o: ['5', '2', '3', '7'],
      s: ['m<sub>l</sub> = −2, −1, 0, +1, +2', '<em>2l + 1 = 5</em> ✓'], n: ['Manyetik kuantum sayısı orbitalin uzaydaki yönelimini belirtir.'] } },
    { q: { t: 'Stern–Gerlach deneyinde spin ½ olan atomlar perdede kaç leke oluşturur?', o: ['2', '1', '3', 'Sürekli şerit'], f: ['sgt'],
      s: ['m<sub>s</sub> yalnız +½ ve −½ olabilir', '→ <em>2 leke</em> ✓ (genel olarak 2s + 1)'], n: ['Klasik fizik sürekli bir şerit öngörür.'] } },
  ] });
  konuEkle('UNI', 'Hidrojen Atomu ve Spin', { dersler: [dSG], gorevler: [gSG] });
})();
