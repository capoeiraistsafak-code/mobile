// Animasyon programı · İş, Enerji ve Güç Laboratuvarı (rampa + sürtünmeli bölge + yay, açılı kuvvetin işi, güç ve verim)
// ve Elektrik Devreleri Laboratuvarı (seri/paralel lambalar, lamba sökme, 60 W–100 W, elektron ve akım yönü)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');
  const KN = 0.025;

  // =====================================================================
  // ENERJİ LABORATUVARI
  // =====================================================================
  const XR0 = -3.4, XR1 = -1.6, Z0 = -0.7, Z1 = 1.3, XY = 2.0;   // rampa başı/sonu, sürtünmeli bölge, yayın ucu
  const sEn = sahne({ icon: '🎢', cam: [[0.8, 3.4, 11.5], [0.8, 1.3, 0]], plate: [12, 4, 0, 0], data: [['g', '10 m/s²']],
    cam2: S => S.mod === 'guc' ? [[0.6, 3.2, 13], [0.6, 2.1, 0]] : [[0.3, 3.9, 12.5], [0.3, 2.2, 0]],
    S0: () => ({ mod: 'rampa', m: 2, h: 2, mu: 0.2, k: 200, X: -4, v: 0, Q: 0, kos: 0, th: 37, ix: 0, F: 50, gy: 0, gt: 5, gm: 50, gh: 3 }),
    kur(g) {
      const G = {}; ['rampa', 'is', 'guc'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      const rampa = kutu(G.rampa, 1, 0.12, 1, 0x64748b, 0, 0, 0, { edge: false });
      kutu(G.rampa, XY - XR1 + 0.6, 0.06, 1, 0x94a3b8, (XR1 + XY + 0.6) / 2, -0.03, 0, { edge: false });
      kutu(G.rampa, Z1 - Z0, 0.065, 1.02, 0x92400e, (Z0 + Z1) / 2, -0.02, 0, { edge: false });
      kutu(G.rampa, 0.15, 0.9, 1, 0x334155, XY + 0.95, 0.45, 0);
      const yay = FZ.yay(G.rampa, 0.18, 9, 0x9ca3af, 0.025); yay.position.set(XY, 0.25, 0); const yaySar = [];   // kıvrımlı helezon yay
      const tabla = kutu(G.rampa, 0.06, 0.36, 0.36, 0x475569, XY, 0.25, 0, { edge: false });   // yayın ucundaki çarpma tablası
      const blok = kutu(G.rampa, 0.4, 0.4, 0.4, 0xdc2626, 0, 0.2, 0);
      const bar = ['#16a34a', '#2563eb', '#7c3aed', '#dc2626'].map((c, i) => kutu(G.rampa, 0.32, 1, 0.2, parseInt(c.slice(1), 16), 0.4 + i * 0.5, 2, -0.8, { edge: false }));
      // iş
      kutu(G.is, 9, 0.02, 1.4, 0x94a3b8, 0, 0.01, 0, { edge: false });
      const ik = kutu(G.is, 0.9, 0.9, 0.9, 0xd97706, -3, 0.45, 0);
      const oF = ok(0x16a34a, 'enF'), oFx = ok(0x86efac, 'enFx'), oFy = ok(0x86efac, 'enFy'), oX = ok(0x111827, 'enX');
      // güç: vinç
      kutu(G.guc, 0.25, 4, 0.25, 0xf59e0b, 1.6, 2, 0); kutu(G.guc, 1.6, 0.18, 0.25, 0xf59e0b, 0.9, 4, 0); const mak = top(G.guc, 0.14, 0x111827, 0.3, 3.9, 0, { edge: false });
      kutu(G.guc, 0.7, 0.5, 0.6, 0x334155, 1.6, 0.25, 0.5); const ip = FZ.cizgi(G.guc, 0x111827); ip.material.dashSize = 100; ip.material.gapSize = 0;
      const yuk = kutu(G.guc, 0.7, 0.7, 0.7, 0x0ea5e9, 0.3, 0.35, 0);
      [['enF', 'F', '#16a34a'], ['enFx', 'F·cosθ', '#15803d'], ['enFy', 'F·sinθ', '#15803d'], ['enX', 'x = 4 m', '#111827']].forEach(([id, h, c]) => etiket(id, h, c));
      ['Ek', 'Ep', 'Ee', 'Q'].forEach((n, i) => etiket('enB' + i, n, ['#16a34a', '#2563eb', '#7c3aed', '#dc2626'][i]));
      kart('enT', '', '#F5C400'); etiket('enA', '', '#334155');
      return { G, rampa, yay, yaySar, tabla, blok, bar, ik, oF, oFx, oFy, oX, yuk, ip };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      [o.oF, o.oFx, o.oFy, o.oX].forEach(a => a.visible = false);
      if (S.mod === 'rampa') {
        const L = XR1 - XR0, th = Math.atan2(S.h, L), g = 10;
        o.rampa.scale.set(Math.hypot(L, S.h), 1, 1); o.rampa.position.set((XR0 + XR1) / 2, S.h / 2 - 0.05, 0); o.rampa.rotation.z = -th;
        if (S.kos) for (let n = 0; n < 8; n++) { const h = dt / 8; let a;
          if (S.X < XR1) a = g * Math.sin(th);
          else if (S.X > XY) a = -S.k * (S.X - XY) / S.m;
          else if (S.X > Z0 && S.X < Z1) { a = -Math.sign(S.v) * S.mu * g; if (Math.abs(S.v) < S.mu * g * h * 1.5) { S.v = 0; S.kos = 0; break; } }
          else a = 0;
          const dX = S.v * h * (S.X < XR1 ? Math.cos(th) : 1); S.v += a * h; if (S.X > Z0 && S.X < Z1) S.Q += S.mu * S.m * g * Math.abs(dX); S.X += dX;
          if (S.X < XR0) { S.X = XR0; S.v = 0; } }
        const y = S.X < XR1 ? S.h * (XR1 - S.X) / L : 0, c = Math.max(0, S.X - XY);
        o.blok.position.set(S.X - 0.2, (S.X - 0.2 < XR1 ? S.h * (XR1 - S.X + 0.2) / L : 0) + 0.2 + (S.X - 0.2 < XR1 ? 0.04 : 0), 0); o.blok.rotation.z = S.X < XR1 ? -th : 0;
        const sol = Math.min(XY, S.X > XY ? S.X : XY), boy = XY + 0.88 - sol;
        o.yay.position.set(sol, 0.25, 0); o.yay.scale.x = Math.max(0.05, boy - 0.03); o.tabla.position.x = sol;
        const Ek = 0.5 * S.m * S.v * S.v, Ep = S.m * g * y, Ee = 0.5 * S.k * c * c, top0 = S.m * g * S.h, E = [Ek, Ep, Ee, S.Q];
        o.bar.forEach((b, i) => { const hh = Math.max(0.01, E[i] / top0 * 1.6); b.scale.y = hh; b.position.y = 1.7 + hh / 2; FZ.show('enB' + i, V3(0.4 + i * 0.5, 1.45, -0.8), 1); });
        FZ.setTag('enT', `E<sub>k</sub> ${fs(Ek)} · E<sub>p</sub> ${fs(Ep)} · E<sub>yay</sub> ${fs(Ee)} · Q ${fs(S.Q)} (J)`); FZ.show('enT', V3(0.3, 3.95, 0), 1);
        FZ.setTag('enA', 'sürtünmeli 2 m'); FZ.show('enA', V3((Z0 + Z1) / 2, -0.35, 0.8), 1);
      } else if (S.mod === 'is') {
        if (S.kos) { S.ix = Math.min(4, S.ix + dt * 1.2); if (S.ix >= 4) S.kos = 0; }
        const x = -3 + S.ix * 1; o.ik.position.x = x; const t = S.th * Math.PI / 180, L = S.F * KN, p = V3(x + 0.45 * (Math.cos(t) >= 0 ? 1 : -1), 0.45, 0.5);
        FZ.setArrow(o.oF, p, V3(Math.cos(t), Math.sin(t), 0), L); FZ.show('enF', p.clone().add(V3(Math.cos(t), Math.sin(t), 0).multiplyScalar(L + 0.25)), 1);
        if (S.th % 180 !== 0 && S.th !== 90) { FZ.setArrow(o.oFx, p, V3(Math.sign(Math.cos(t)), 0, 0), Math.abs(Math.cos(t)) * L); FZ.show('enFx', p.clone().add(V3(Math.sign(Math.cos(t)) * (Math.abs(Math.cos(t)) * L + 0.4), -0.2, 0)), 1);
          FZ.setArrow(o.oFy, p, V3(0, 1, 0), Math.sin(t) * L); FZ.show('enFy', p.clone().add(V3(-0.5, Math.sin(t) * L, 0)), 1); }
        FZ.setArrow(o.oX, V3(-3, 1.6, 0), V3(1, 0, 0), 4); FZ.show('enX', V3(-1, 1.9, 0), 1);
        const cs = { 0: 1, 37: 0.8, 53: 0.6, 90: 0, 180: -1 }[S.th], W = S.F * 4 * cs;
        FZ.setTag('enT', `W = ${S.F} · 4 · cos${S.th}° = <b>${fs(W)} J</b>`); FZ.show('enT', V3(0.3, 3.3, 0), 1);
      } else {
        if (S.kos) { S.gy = Math.min(1, S.gy + dt / S.gt); if (S.gy >= 1) S.kos = 0; }
        const yy = 0.35 + S.gy * S.gh * 0.9; o.yuk.position.y = yy; FZ.setLine(o.ip, [V3(0.3, 3.9, 0), V3(0.3, yy + 0.35, 0)]);
        const P = S.gm * 10 * S.gh / S.gt;
        FZ.setTag('enT', `P = ${F('mgh', 't')} = ${F(`${S.gm} · 10 · ${S.gh}`, String(S.gt))} = <b>${fs(P)} W</b>`); FZ.show('enT', V3(-1.2, 1.6, 0.6), 1);
        FZ.setTag('enA', `t = ${fs(S.gy * S.gt)} s`); FZ.show('enA', V3(-0.6, yy, 0.5), 1);
      }
    },
    qp: () => V3(0.3, 3.8, 0) });
  const rampaK = (S, h = 2, mu = 0.2) => Object.assign(S, { mod: 'rampa', h, mu, m: 2, k: 200, X: XR0, v: 0, Q: 0, kos: 0 });
  const isK = (S, th) => Object.assign(S, { mod: 'is', th, F: 50, ix: 0, kos: 0 });
  const gucK = (S, gm, gh, gt) => Object.assign(S, { mod: 'guc', gm, gh, gt, gy: 0, kos: 0 });

  const dEn = ders(sEn, { yk: 'TYT4-d2', no: 2, icon: '🎢', name: 'Enerji laboratuvarı: rampa, sürtünme, yay', task: 'Mekanik enerjinin dönüşümü, sürtünmede ısıya giden enerji, açılı kuvvetin işi, güç ve verim.', steps: [
    { do: S => rampaK(S), k: { tur: 'merak', b: 'Enerji nereye gider?', m: ['2 kg\'lık blok 2 m yükseklikten sürtünmesiz rampadan kayacak, 2 m\'lik sürtünmeli bölgeden geçip yaya çarpacak. Geri döndüğünde yine 2 m\'ye çıkabilir mi?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Enerji türleri', f: ['enB0', 'enB1', 'enB2', 'enB3'], m: [`${FM(`E<sub>k</sub> = ${F('1', '2')} m v<sup>2</sup>`)} · ${FM('E<sub>p</sub> = m g h')} · ${FM(`E<sub>yay</sub> = ${F('1', '2')} k x<sup>2</sup>`)}`, 'Başta: E<sub>p</sub> = 2 · 10 · 2 = 40 J. Sürtünme kuvvetinin yaptığı iş ısıya (Q) dönüşür: Q = μ m g · d.'] } },
    { p: { t: 'μ = 0,2 olan 2 m\'lik bölgeden bir kez geçen blok kaç J enerjiyi ısıya verir?', o: ['4', '8', '40', '0,8'], d: 1, b: ['Blok: m = 2 kg · g = 10 m/s² · yatay zeminde N = mg', 'Sürtünmeli bölge: μ = 0,2, uzunluk d = 2 m', 'Isıya giden enerji = sürtünmenin işi: Q = f · d = μ · N · d'] } },
    { sub: 'Bloğu bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Enerji dönüşüyor…', until: S => S.Q >= 16 || !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Toplam enerji korunur', f: ['enT'], m: ['Her geçişte Q = 0,2 · 2 · 10 · 2 = <em>8 J</em> ısıya gitti. Yaya 32 J ulaştı; dönüşte bir 8 J daha → 24 J ile rampada <em>1,2 m</em>\'ye çıkar.', `Her an: ${FM('E<sub>k</sub> + E<sub>p</sub> + E<sub>yay</sub> + Q = 40 J')}`] } },
    { do: S => isK(S, 37), k: { tur: 'kavram', b: 'İş: W = F · x · cosθ', f: ['enF', 'enFx', 'enFy'], m: ['Yalnız yer değiştirme doğrultusundaki bileşen (F·cosθ) iş yapar.', 'θ = 37° → W = 50 · 4 · 0,8 = <em>160 J</em> · θ = 90° → <em>0</em> · θ = 180° → <em>−200 J</em> (fren).'] } },
    { x: { b: 'Açıyı değiştir', m: ['Kutu 4 m ilerliyor; F = 50 N.'],
      kay: [{ ad: 'th', etiket: 'θ', min: 0, max: 180, adim: 1, deger: 37, birim: '°', set: (S, v) => { const L = [0, 37, 53, 90, 180]; const a = L.reduce((p, c) => Math.abs(c - v) < Math.abs(p - v) ? c : p, 0); isK(S, a); S._th = a; S.kos = 1; } }],
      olc: S => { const W = 50 * 4 * { 0: 1, 37: 0.8, 53: 0.6, 90: 0, 180: -1 }[S._th]; return `W = 50 · 4 · cos${S._th}° = <em>${fs(W)} J</em>${S._th === 90 ? '<br>Kuvvet yer değiştirmeye dik: iş yapmaz.' : S._th > 90 ? '<br>Kuvvet harekete zıt: negatif iş.' : ''}`; } } },
    { do: S => gucK(S, 50, 3, 5), k: { tur: 'kavram', b: 'Güç', f: ['enT'], m: [`${FM(`P = ${F('W', 't')}`)} · birim watt (W = J/s). 50 kg\'lık yükü 3 m, 5 s\'de kaldıran motor: P = ${F('50 · 10 · 3', '5')} = <em>300 W</em>.`, 'Aynı işi daha kısa sürede yapan motor daha güçlüdür. 1 kWh = 3,6 · 10<sup>6</sup> J (enerji birimidir, güç değil!).'] } },
    { sub: 'Motoru çalıştıralım.', go: '▶︎ Kaldır' },
    { do: S => { S.kos = 1; }, sub: 'Yük yükseliyor…', until: S => S.gy >= 1 },
    { k: { tur: 'dikkat', b: 'Verim', m: [`${FM(`Verim = ${F('yararlı iş', 'harcanan enerji')} · 100`)} · hiçbir makinenin verimi %100 olamaz (sürtünme, ısı).`, 'Motor 400 W harcayıp 300 W iş yapıyorsa verimi %75.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Toplam enerji korunur; sürtünme mekanik enerjiyi ısıya çevirir: Q = μmg·d.', `${FM('W = F x cosθ')} · ${FM(`P = ${F('W', 't')}`)} · verim < %100`] } },
  ] });
  const gEn = gorev(sEn, { yk: 'TYT4-g2', no: 2, icon: '🔋', name: 'Enerji laboratuvarı soruları', task: 'Enerji korunumu, sürtünme ısısı, yay, açılı kuvvetin işi, güç ve verim.', data: [['g', '10 m/s²']], steps: [
    { do: S => rampaK(S), sub: '2 kg blok, 2 m yükseklik, μ = 0,2, d = 2 m.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: '2 kg\'lık blok 2 m yükseklikten sürtünmesiz rampadan bırakılıyor; 2 m uzunluğundaki μ = 0,2 bölgeyi geçip yaya çarpıyor. Yaydaki en büyük enerji kaç J olur?', o: ['32', '40', '8', '24', '64'], f: ['enT', 'enB2'],
      s: ['E<sub>başta</sub> = m g h = 2 · 10 · 2 = 40 J', 'Q = μ m g d = 0,2 · 2 · 10 · 2 = 8 J', 'E<sub>yay</sub> = 40 − 8 = <em>32 J</em> ✓'], n: ['Yay en çok sıkıştığında blok bir an durur: kinetik enerji sıfır, enerjinin hepsi yayda.', 'Sürtünme kuvveti her zaman harekete zıttır; blok sola dönerken sürtünme sağa olur.'] } },
    { q: { t: 'Aynı blok yaydan geri dönüp sürtünmeli bölgeyi tekrar geçerse rampada en çok kaç m yükselir?', o: ['1,2', '1,6', '2', '0,8', '2,4'], f: ['enT'],
      s: ['Kalan enerji: 40 − 8 − 8 = 24 J', `h = ${F('24', '2 · 10')} = <em>1,2 m</em> ✓`], n: ['Rampa sürtünmesiz olduğundan rampada enerji kaybı yoktur.'] } },
    { do: S => isK(S, 53), q: { t: 'Yatayla 53° açı yapan 50 N\'luk kuvvetle çekilen kutu yatayda 4 m ilerliyor. Kuvvetin yaptığı iş kaç J\'dür? (cos53° = 0,6)', o: ['120', '160', '200', '0', '240'], f: ['enF', 'enFx'],
      s: ['W = F · x · cosθ = 50 · 4 · 0,6 = <em>120 J</em> ✓'], n: ['Kuvvetin düşey bileşeni (F·sinθ) yer değiştirmeye dik olduğu için iş yapmaz.'] } },
    { do: S => isK(S, 90), q: { t: 'Kutuyu taşıyan biri onu yere paralel sabit hızla 4 m yürütüyor. Taşıyanın kutuya uyguladığı yukarı yönlü kuvvetin bu yer değiştirmede yaptığı iş kaç J\'dür?', o: ['0', '200', '800', '−200', '1'], f: ['enF', 'enX'],
      s: ['Kuvvet yukarı, yer değiştirme yatay: θ = 90°, cos90° = 0', 'W = <em>0</em> ✓'], n: ['Fizikte iş için kuvvetin yer değiştirme doğrultusunda bileşeni olmalıdır; yorulmak iş yapıldığını göstermez.'] } },
    { do: S => gucK(S, 40, 3, 6), q: { t: '40 kg\'lık yükü 3 m yüksekliğe 6 s\'de sabit hızla çıkaran motorun verimi %80\'dir. Motorun harcadığı güç kaç W\'tır?', o: ['250', '200', '160', '300', '500'], f: ['enT'],
      s: [`Yararlı güç: P = ${F('40 · 10 · 3', '6')} = 200 W`, `Harcanan: ${F('200', '0,8')} = <em>250 W</em> ✓`], n: ['Harcanan güç her zaman yararlı güçten büyüktür; fark ısı ve sesle kaybolur.'] } },
  ] });
  (FZ.SAHNE = FZ.SAHNE || {}).enerji = sEn;   // kitap soru bankaları (kitap10.js) bu düzeneği kullanır
  FZ.konuEk('TYT', 'Enerji', { dersler: [dEn], gorevler: [gEn] });

  // =====================================================================
  // ELEKTRİK DEVRELERİ LABORATUVARI
  // =====================================================================
  const lamba = (g, x, z) => { const a = FZ.ampul(g, 1); a.position.set(x, 0, z); return a; };
  const sDv = sahne({ icon: '💡', cam: [[0.7, 9.6, 9.6], [0.7, 0, -0.3]], plate: [10, 5, 0, 0], data: [['Üreteç', 'ideal (iç direnç yok)']],
    S0: () => ({ mod: 'seri', sok: [0, 0, 0], faz: 0 }),
    kur(g) {
      kutu(g, 5.8, 0.06, 3.4, 0xe7d3a8, -0.1, 0.03, 0, { edge: false });
      const pil = FZ.pil(g, 1.1); pil.position.set(-2.6, 0.26, 0); pil.rotation.x = -Math.PI / 2;   // yatık: (+) ucu arkada (−z), (−) ucu önde
      const tel = FZ.cizgi(g, 0x1f2937); tel.material.dashSize = 100; tel.material.gapSize = 0; const tel2 = []; for (let i = 0; i < 3; i++) { const t = FZ.cizgi(g, 0x1f2937); t.material.dashSize = 100; t.material.gapSize = 0; tel2.push(t); }
      const L = [lamba(g, 0, 0), lamba(g, 0, 0), lamba(g, 0, 0)];
      const el = []; for (let i = 0; i < 22; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 })); g.add(m); el.push(m); }
      const akim = ok(0xdc2626, 'dvI');
      ['dvL0', 'dvL1', 'dvL2'].forEach(id => etiket(id, '', '#334155')); etiket('dvI', 'akım I', '#dc2626'); etiket('dvE', 'elektronlar', '#dc2626'); etiket('dvP', '+', '#dc2626'); etiket('dvM', '−', '#2563eb'); kart('dvT', '', '#F5C400');
      return { tel, tel2, L, el, akim };
    },
    tick(S, dt, o) {
      const seri = S.mod === 'seri' || S.mod === 's60', iki = S.mod === 's60' || S.mod === 'p60', n = iki ? 2 : 3;
      // devre geometrisi (tahta düzleminde): üreteç solda, + ucu arkada (z = −1,2), − ucu önde (z = +1,2)
      const xs = iki ? [-0.9, 1.5] : [-1.1, 0.4, 1.9];
      let yol;
      if (seri) { yol = [V3(-2.6, 0.1, -1.2), ...xs.map(x => V3(x, 0.1, -1.2)), V3(2.4, 0.1, -1.2), V3(2.4, 0.1, 1.2), V3(-2.6, 0.1, 1.2)]; FZ.setLine(o.tel, yol); o.tel2.forEach(t => t.visible = false); }
      else { FZ.setLine(o.tel, [V3(xs[n - 1], 0.1, -1.2), V3(-2.6, 0.1, -1.2), V3(-2.6, 0.1, -0.8)]); o.tel.visible = true;
        o.tel2.forEach((t, i) => { if (i >= n) { t.visible = false; return; } FZ.setLine(t, [V3(xs[i], 0.1, -1.2), V3(xs[i], 0.1, 1.2)]); });
        o.tel2[2].visible = n > 2; }
      // alt (−) ana hat paralelde
      if (!seri) { if (!o.altHat) { o.altHat = FZ.cizgi(o.tel.parent, 0x1f2937); o.altHat.material.dashSize = 100; o.altHat.material.gapSize = 0; } FZ.setLine(o.altHat, [V3(-2.6, 0.1, 0.8), V3(-2.6, 0.1, 1.2), V3(xs[n - 1], 0.1, 1.2)]); }
      else if (o.altHat) o.altHat.visible = false;
      // güçler
      const R = iki ? [806, 484] : [1, 1, 1], V = iki ? 220 : 1;
      let P = [];
      if (seri) { const acik = S.sok.slice(0, n).some(x => x); const Rt = R.slice(0, n).reduce((a, b) => a + b, 0), I = acik ? 0 : V / Rt; P = R.slice(0, n).map(r => I * I * r); S.I = I; }
      else { P = R.slice(0, n).map((r, i) => S.sok[i] ? 0 : V * V / r); S.I = P.reduce((a, b) => a + b, 0) / V; }
      const Pmax = iki ? 100 : 1;
      o.L.forEach((l, i) => { l.visible = i < n; if (i >= n) return; const z = seri ? -1.2 : 0; l.position.set(xs[i], 0.06, z); l.visible = !S.sok[i] || true; l.cam.visible = !S.sok[i]; l.hale.visible = !S.sok[i];
        l.parla(Math.min(1, Math.sqrt(P[i] / Pmax))); FZ.setTag('dvL' + i, S.sok[i] ? 'söküldü' : iki ? `${i ? 100 : 60} W` : `L${i + 1}`); FZ.show('dvL' + i, V3(xs[i], 0.4, z + (iki ? (seri ? 1.0 : 0.65) : 0.6)), 1); });
      // elektronlar (−'den çıkıp +'ya) — seri devrede tek yol
      S.faz += dt * S.I * (iki ? 2.2 : 0.35) * (seri ? 1 : 0.4);
      const ypath = seri ? [...yol].reverse() : [V3(-2.6, 0.1, 1.2), V3(xs[0], 0.1, 1.2), V3(xs[0], 0.1, -1.2), V3(-2.6, 0.1, -1.2)];
      const uz = []; let T = 0; for (let i = 1; i < ypath.length; i++) { T += ypath[i].distanceTo(ypath[i - 1]); uz.push(T); }
      o.el.forEach((m, i) => { m.visible = S.I > 1e-6; if (!m.visible) return; let s = ((S.faz * 2 + i / o.el.length) % 1) * T; let k = 0; while (k < uz.length - 1 && s > uz[k]) k++; const s0 = k ? uz[k - 1] : 0, a = ypath[k], b = ypath[k + 1]; m.position.copy(a.clone().lerp(b, (s - s0) / (uz[k] - s0))).add(V3(0, 0.08, 0)); });
      // akım oku (+ → −, elektronlara zıt): arka hatta sağa
      o.akim.visible = S.I > 1e-6; if (o.akim.visible) { FZ.setArrow(o.akim, V3(-2.4, 0.35, -1.55), V3(1, 0, 0), 1.2); FZ.show('dvI', V3(-1.2, 0.35, -1.85), 1); FZ.show('dvE', V3(-0.6, 0.3, 1.65), 1); }
      FZ.show('dvP', V3(-3.05, 0.3, -0.75), 1); FZ.show('dvM', V3(-3.05, 0.3, 0.75), 1);
      FZ.setTag('dvT', { seri: 'Seri bağlı üç lamba', paralel: 'Paralel bağlı üç lamba', s60: '60 W ve 100 W lambalar seri', p60: '60 W ve 100 W lambalar paralel' }[S.mod] + (S.I > 1e-6 ? '' : ' · akım yok')); if (iki && S.I > 1e-6) FZ.setTag('dvT', `${seri ? 'Seri' : 'Paralel'}: 60 W → ${Math.round(P[0])} W · 100 W → ${Math.round(P[1])} W`); FZ.show('dvT', V3(1.1, 0.3, -3.1), 1);
    },
    qp: () => V3(0, 1.5, -2) });
  const dvK = (S, mod) => Object.assign(S, { mod, sok: [0, 0, 0] });
  const dDv = ders(sDv, { yk: 'TYT7-d2', no: 2, icon: '💡', name: 'Devre laboratuvarı: lamba sökme ve 60 W–100 W', task: 'Seri ve paralel bağlama, lamba sökünce ne olur, akım ve elektron yönü, 60 W ve 100 W lambalar, direnç, ölçü aletleri, güvenlik.', steps: [
    { do: S => dvK(S, 'seri'), k: { tur: 'merak', b: 'Evde bir lamba yanınca neden diğerleri sönmez?', m: ['Lambaları iki farklı şekilde bağlayıp birini sökeceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Akım ve elektron yönü', f: ['dvI', 'dvE'], m: ['Elektronlar üretecin <em>(−) ucundan</em> çıkıp devreyi dolaşarak (+) ucuna gider.', 'Akımın yönü ise <em>(+)\'dan (−)\'ye</em> kabul edilir (elektron akışının tersi).'] } },
    { k: { tur: 'kavram', b: 'Seri bağlama', m: ['Lambalar tek bir yol üzerinde: hepsinden <em>aynı akım</em> geçer.', 'Eşdeğer direnç: R<sub>eş</sub> = R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub>.'] } },
    { p: { t: 'Seri bağlı üç lambadan L2 sökülürse diğerleri ne olur?', o: ['Daha parlak yanar', 'Hepsi söner', 'Değişmez', 'Yalnız L1 söner'], d: 1 } },
    { sub: 'L2\'yi sökelim.', go: '▶︎ Sök' },
    { do: S => { S.sok = [0, 1, 0]; }, sub: 'L2 söküldü.', wait: 1.6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Seri devre: yol kesildi', f: ['dvT'], m: ['Tek yol açıldı: akım durdu, <em>bütün lambalar söndü</em>. Eski yılbaşı süs lambaları böyleydi.'] } },
    { do: S => dvK(S, 'paralel'), k: { tur: 'kavram', b: 'Paralel bağlama', m: ['Her lamba ayrı bir koldan üretece bağlı: hepsinin uçları arasında <em>aynı gerilim</em> var.', `${FM(`${F('1', 'R<sub>eş</sub>')} = ${F('1', 'R<sub>1</sub>')} + ${F('1', 'R<sub>2</sub>')} + ${F('1', 'R<sub>3</sub>')}`)}`, 'Paralel bağlı özdeş lambalar seridekilerden çok daha parlak yanar.'] } },
    { p: { t: 'Paralel bağlı üç lambadan biri sökülürse diğerleri ne olur? (İdeal üreteç)', o: ['Söner', 'Parlaklıkları değişmez', 'Daha parlak yanar', 'Sönükleşir'], d: 1 } },
    { sub: 'L2\'yi sökelim.', go: '▶︎ Sök' },
    { do: S => { S.sok = [0, 1, 0]; }, sub: 'L2 söküldü.', wait: 1.6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Paralel devre: diğer kollar etkilenmez', m: ['Diğer lambaların gerilimi değişmedi: <em>parlaklıkları aynı</em>. Üreteçten çekilen toplam akım azaldı.', 'Evdeki prizler ve lambalar paralel bağlıdır.'] } },
    { do: S => dvK(S, 's60'), p: { t: '220 V için yapılmış 60 W ve 100 W lambalar seri bağlanıp 220 V\'a takılıyor. Hangisi daha parlak yanar?', o: ['100 W', '60 W', 'Eşit', 'İkisi de yanmaz'], d: 1 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Seride direnci büyük olan parlak', f: ['dvL0', 'dvL1', 'dvT'], m: [`${FM(`R = ${F('V<sup>2</sup>', 'P')}`)} → R<sub>60</sub> ≈ 807 Ω, R<sub>100</sub> = 484 Ω. Seride akım aynı, ${FM('P = I<sup>2</sup> R')}: direnci büyük olan <em>60 W</em> lamba daha parlak.`] } },
    { do: S => dvK(S, 'p60'), k: { tur: 'gozlem', b: 'Paralelde gücü büyük olan parlak', f: ['dvL0', 'dvL1', 'dvT'], m: [`Paralelde gerilim aynı, ${FM(`P = ${F('V<sup>2</sup>', 'R')}`)}: <em>100 W</em> lamba daha parlak (etiket değerleriyle yanarlar).`] } },
    { k: { tur: 'kavram', b: 'Direnç ve ölçü aletleri', m: [`${FM(`R = ρ ${F('L', 'A')}`)} · tel uzarsa direnç artar, kalınlaşırsa azalır; nikrom bakırdan çok dirençlidir.`, '<em>Ampermetre</em> devreye seri, <em>voltmetre</em> ölçülen elemana paralel bağlanır. Ohm yasası: ' + FM('V = I · R')] } },
    { k: { tur: 'gunluk', b: 'Evde elektrik ve güvenlik', m: ['Harcanan enerji: E = P · t. 2000 W ısıtıcı 3 saatte 6 kWh harcar.', '<em>Sigorta</em> aşırı akımda devreyi keser; <em>kısa devre</em>de direnç çok küçük, akım çok büyük olur. <em>Topraklama</em> kaçak akımı toprağa verir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Seri: aynı akım, bir lamba sökülünce hepsi söner · paralel: aynı gerilim, diğerleri etkilenmez.', 'Seride 60 W, paralelde 100 W daha parlak · elektron (−)\'den (+)\'ya, akım (+)\'dan (−)\'ye.'] } },
  ] });
  const gDv = gorev(sDv, { yk: 'TYT7-g2', no: 2, icon: '💡', name: 'Devre laboratuvarı soruları', task: 'Seri–paralel lamba sökme, 60 W–100 W, eşdeğer direnç, enerji tüketimi ve güvenlik.', data: [['Üreteç', 'ideal (iç direnç yok)']], steps: [
    { do: S => dvK(S, 'seri'), sub: 'Özdeş üç lamba.', go: '▶︎ Başlat' },
    { do: S => { S.sok = [0, 0, 1]; }, q: { t: 'İdeal üretece seri bağlı özdeş üç lambadan L3 sökülüyor. L1 ve L2 için ne söylenir?', o: ['İkisi de söner', 'İkisi de daha parlak yanar', 'Parlaklıkları değişmez', 'L1 söner, L2 yanar'], f: ['dvT'],
      s: ['Seri devrede tek yol vardır; bir lamba sökülünce devre açılır.', 'Akım sıfır → <em>ikisi de söner</em> ✓'], n: ['Paralel bağlı olsalardı diğer lambalar aynı parlaklıkta yanmaya devam ederdi.'] } },
    { do: S => dvK(S, 'paralel'), q: { t: 'Dirençleri 6 Ω olan üç özdeş lamba paralel bağlanıyor. Eşdeğer direnç kaç Ω\'dur?', o: ['2', '18', '6', '3', '4'],
      s: [`${F('1', 'R<sub>eş</sub>')} = ${F('1', '6')} + ${F('1', '6')} + ${F('1', '6')} = ${F('3', '6')}`, 'R<sub>eş</sub> = <em>2 Ω</em> ✓'], n: ['n özdeş direnç paralel bağlanırsa R<sub>eş</sub> = R / n olur; eşdeğer direnç en küçük dirençten bile küçüktür.'] } },
    { do: S => dvK(S, 's60'), q: { t: '220 V için yapılmış 60 W ve 100 W lambalar seri bağlanıp 220 V\'a takılıyor. Hangisi daha parlak yanar ve neden?', o: ['60 W; direnci büyüktür ve akımlar eşittir', '100 W; gücü büyüktür', 'Eşit; gerilimleri aynıdır', '100 W; direnci büyüktür'], f: ['dvL0', 'dvL1'],
      s: [`R = ${F('V<sup>2</sup>', 'P')}: 60 W lambanın direnci büyük.`, 'Seride I aynı, P = I²R → <em>60 W daha parlak</em> ✓'], n: ['Etiketteki güç, lamba 220 V\'a tek başına bağlanınca harcadığı güçtür.'] } },
    { q: { t: '2000 W\'lık ısıtıcı günde 3 saat çalışıyor. 1 kWh 3 TL ise 30 günlük ücret kaç TL olur?', o: ['540', '180', '18', '5400', '1080'],
      s: ['Günlük: 2 kW · 3 h = 6 kWh', '30 gün: 180 kWh → 180 · 3 = <em>540 TL</em> ✓'], n: ['kWh bir enerji birimidir: 1 kWh = 3,6 · 10<sup>6</sup> J.'] } },
    { q: { t: 'Bir tel aynı maddeden, boyu iki katı ve kesit alanı yarısı olan bir telle değiştiriliyor. Direnci kaç katına çıkar?', o: ['4', '2', '1', F('1', '2')],
      s: [`R = ρ ${F('L', 'A')} → ${F('2L', 'A/2')} = 4 ${F('L', 'A')}`, '<em>4 katı</em> ✓'], n: ['Direnç boyla doğru, kesit alanıyla ters orantılıdır.'] } },
  ] });
  FZ.konuEk('TYT', 'Elektrik ve Manyetizma', { dersler: [dDv], gorevler: [gDv] });
})();
