// Kitap düzeninde HİKÂYE MODU + SORU SİSTEMİ + TUZAK SORULAR · TYT Doğrusal Hareket · Newton'un Hareket Yasaları · Enerji ve Hareket
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };
  const koli = (g) => { const a = new THREE.Group(); g.add(a); kutu(a, 1, 1, 1, 0xc08a4a, 0, 0.5, 0); kutu(a, 1.01, 0.12, 0.2, 0xd6c08a, 0, 1.0, 0, { edge: false }); kutu(a, 0.2, 0.12, 1.01, 0xd6c08a, 0, 1.0, 0, { edge: false }); return a; };
  // raylı yol profili (enerji): x ∈ [−4,4]
  const RY = x => 0.35 + (x < -1 ? 1.3 * (1 + Math.cos(Math.PI * (x + 4) / 3)) : x < 2.5 ? 0.6 * (1 - Math.cos(2 * Math.PI * (x + 1) / 3.5)) : 0);
  const RYs = x => RY(x);
  const sHk = sahne({ icon: '🚗', cam: [[1.8, 3.6, 12], [1.8, 1.2, 0]], plate: [13, 5, 0, 0], data: [['g', '10 m/s²']],
    cam2: S => ({ yol: [[1.6, 4.6, 11], [1.6, 0.9, 0]], kutu: [[2.0, 3.2, 10], [2.0, 0.9, 0]], ray: [[1.6, 3.6, 12], [1.6, 1.4, 0]] })[S.mod],
    S0: () => ({ mod: 'yol', t: 0, tk: 0, kos: 0, x1: 0, v1: 10, a1: 0, x2: 60, v2: -5, a2: 0, iz: [[], []], F: 20, m: 5, mus: 0.4, muk: 0.3, xk: -2, vk: 0, sp: 0, xr: -3.9, vr: 0, Q: 0, mr: 2, fr: 0 }),
    kur(g) {
      const G = {}; ['yol', 'kutu', 'ray'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      FZ.yol(G.yol, 10, 2, 0, 0.6); const a1 = FZ.araba(G.yol, 0xef4444), a2 = FZ.araba(G.yol, 0x2563eb); a1.scale.setScalar(0.5); a2.scale.setScalar(0.5);
      for (let i = 0; i <= 10; i++) { kutu(G.yol, 0.04, 0.01, 0.3, 0xffffff, -4.5 + i * 0.9, 0.04, 1.7, { edge: false }); etiket('k4m' + i, `${i * 10}`, '#1f232c'); }
      const pano = kutu(G.yol, 4.4, 2.6, 0.05, 0x111827, 1.8, 3.2, -1.6, { edge: false }); const eks = duz(G.yol, 0xe5e7eb), c1 = duz(G.yol, 0xef4444), c2 = duz(G.yol, 0x3b82f6);
      kutu(G.kutu, 9, 0.1, 2, 0x9ca3af, 0, 0.05, 0); const kz = kutu(G.kutu, 3, 0.11, 2, 0x7f1d1d, 2, 0.055, 0, { edge: false });
      const kl = koli(G.kutu); const ece = FZ.kiz(G.kutu, 0xdb2777, 1);
      const rp = []; for (let i = 0; i <= 120; i++) { const x = -4 + i / 15; rp.push(V3(x, RYs(x), 0)); }
      [-0.3, 0.3].forEach(z => { const L = duz(G.ray, 0x6b7280); FZ.setLine(L, rp.map(p => V3(p.x, p.y, z))); });
      for (let i = 0; i < 40; i++) { const x = -4 + i * 0.2; kutu(G.ray, 0.08, 0.05, 0.8, 0x78350f, x, RYs(x) - 0.04, 0, { edge: false }); if (RYs(x) > 0.5) kutu(G.ray, 0.06, RYs(x) - 0.1, 0.06, 0xf59e0b, x, (RYs(x) - 0.1) / 2, -0.35, { edge: false }); }
      kutu(G.ray, 1.5, 0.02, 1, 0x7f1d1d, 3.25, 0.36, 0, { edge: false });
      const vg = new THREE.Group(); G.ray.add(vg); kutu(vg, 0.5, 0.3, 0.5, 0xdc2626, 0, 0.2, 0); [-0.17, 0.17].forEach(x => [-0.26, 0.26].forEach(z => { const t = silindir(vg, 0.07, 0.07, 0.04, 0x111827, x, 0.05, z, { edge: false }); t.rotation.x = Math.PI / 2; }));
      const bar = ['#16a34a', '#2563eb', '#dc2626'].map((c, i) => kutu(G.ray, 0.3, 1, 0.2, parseInt(c.slice(1), 16), 1.6 + i * 0.45, 2.5, -1.2, { edge: false }));
      const O = { F: ok(0xec4899, 'k4F'), f: ok(0xdc2626, 'k4f'), mg: ok(0x475569, 'k4g'), N: ok(0x0ea5e9, 'k4N'), v: ok(0x16a34a, 'k4v'), v1: ok(0xef4444, 'k4v1'), v2: ok(0x2563eb, 'k4v2') };
      [['k4F', 'F', '#db2777'], ['k4f', 'f<sub>s</sub>', '#dc2626'], ['k4g', 'mg', '#475569'], ['k4N', 'N', '#0284c7'], ['k4v', 'v', '#16a34a'], ['k4v1', '', '#dc2626'], ['k4v2', '', '#2563eb']].forEach(([i, h, c]) => etiket(i, h, c));
      ['Ek', 'Ep', 'Q'].forEach((n, i) => etiket('k4b' + i, n, ['#16a34a', '#2563eb', '#dc2626'][i])); kart('k4K', '', '#F5C400'); kart('k4P', 'konum – zaman', '#475569');
      return { G, a1, a2, pano, eks, c1, c2, kl, ece, vg, bar, O };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k); Object.values(o.O).forEach(a => a.visible = false);
      const A = (a, p, d, L, id) => { if (L < 0.03) return; FZ.setArrow(a, p, d, L); FZ.show(id, p.clone().add(d.clone().normalize().multiplyScalar(L + 0.28)), 1); };
      if (S.mod === 'yol') {
        if (S.kos) { S.tk += dt * 0.8; const T = S.tson || 6; if (S.tk >= T) { S.tk = T; S.kos = 0; } const L1 = S.iz[0], L2 = S.iz[1]; L1.push([S.tk, S.x1 + S.v1 * S.tk + S.a1 * S.tk * S.tk / 2]); L2.push([S.tk, S.x2 + S.v2 * S.tk + S.a2 * S.tk * S.tk / 2]); }
        const t = S.tk, X1 = S.x1 + S.v1 * t + S.a1 * t * t / 2, X2 = S.x2 + S.v2 * t + S.a2 * t * t / 2, V1 = S.v1 + S.a1 * t, V2 = S.v2 + S.a2 * t, px = x => -4.5 + x * 0.09;
        o.a1.position.set(px(X1), 0.03, 0.15); o.a2.position.set(px(X2), 0.03, 1.05); o.a1.rotation.y = V1 < 0 ? Math.PI : 0; o.a2.rotation.y = V2 < 0 ? Math.PI : 0;
        A(o.O.v1, V3(px(X1), 0.8, 0.15), V3(Math.sign(V1) || 1, 0, 0), Math.abs(V1) * 0.08, 'k4v1'); FZ.setTag('k4v1', `${fs(Math.abs(V1))} m/s`);
        A(o.O.v2, V3(px(X2), 0.8, 1.05), V3(Math.sign(V2) || 1, 0, 0), Math.abs(V2) * 0.08, 'k4v2'); FZ.setTag('k4v2', `${fs(Math.abs(V2))} m/s`);
        for (let i = 0; i <= 10; i++) FZ.show('k4m' + i, V3(-4.5 + i * 0.9, 0.05, 2.1), 1);
        const X = tt => -0.2 + tt / (S.tson || 6) * 4, Y = x => 2.0 + x / 100 * 2.3, Z = -1.55; FZ.setLine(o.eks, [V3(X(0), Y(100), Z), V3(X(0), Y(0), Z), V3(X(S.tson || 6) + 0.1, Y(0), Z)]);
        [[o.c1, S.iz[0]], [o.c2, S.iz[1]]].forEach(([c, L]) => { if (L.length > 1) FZ.setLine(c, L.map(([tt, x]) => V3(X(tt), Y(Math.max(0, Math.min(100, x))), Z))); else c.visible = false; });
        FZ.show('k4P', V3(1.8, 4.7, -1.55), 1); FZ.setTag('k4K', `t = ${fs(t)} s`); FZ.show('k4K', V3(-3.2, 3.6, 0), 1);
      } else if (S.mod === 'kutu') {
        const mg = S.m * 10, xm = -2 + S.xk, inKz = xm > 0.5 && xm < 3.5, mus = inKz ? S.mus : S.sp, muk = inKz ? S.muk : S.sp; let f = 0, a = 0;
        if (S.vk === 0 && Math.abs(S.F) <= mus * mg) f = -S.F; else { f = -(Math.sign(S.vk) || Math.sign(S.F)) * muk * mg; a = (S.F + f) / S.m; }
        if (S.kos) { S.vk += a * dt; if (S.vk < 0 && S.F === 0) S.vk = 0; S.xk += S.vk * dt * 0.5; if (xm > 4) S.kos = 0; }
        o.kl.position.set(xm, 0.1, 0); o.kl.scale.setScalar(0.6 + S.m * 0.04); const h = 0.6 + S.m * 0.04, c = V3(xm, 0.1 + h / 2, h / 2 + 0.05);
        o.ece.position.set(xm - h / 2 - 0.45, 0.1, 0); o.ece.visible = S.F > 0; if (S.F > 0) [0, 1].forEach(i => FZ.koluUzat(o.ece, i, V3(xm - h / 2, 0.1 + h * 0.6, i ? -0.1 : 0.1)));
        A(o.O.F, V3(xm - h / 2 - 0.02, 0.1 + h * 0.6, h / 2 + 0.05), V3(1, 0, 0), S.F * 0.03, 'k4F');
        A(o.O.f, V3(xm + (Math.sign(f) || 1) * h / 2, 0.13, h / 2 + 0.05), V3(Math.sign(f) || -1, 0, 0), Math.abs(f) * 0.03, 'k4f'); FZ.setTag('k4f', inKz ? (S.vk ? 'f<sub>k</sub>' : 'f<sub>s</sub>') : 'f');
        A(o.O.mg, c, V3(0, -1, 0), mg * 0.03, 'k4g'); A(o.O.N, V3(xm + 0.2, 0.1, h / 2 + 0.05), V3(0, 1, 0), mg * 0.03, 'k4N');
        A(o.O.v, V3(xm, 0.1 + h + 0.3, 0), V3(1, 0, 0), S.vk * 0.25, 'k4v');
        FZ.setTag('k4K', `m = ${S.m} kg · F = ${S.F} N · ${inKz ? `μ<sub>s</sub> = ${fs(S.mus)}, μ<sub>k</sub> = ${fs(S.muk)}` : 'sürtünmesiz'} · a = ${fs(a)} m/s²`); FZ.show('k4K', V3(0.5, 2.6, 0), 1);
      } else {
        const g = 10, h0 = RYs(-3.9) - 0.35;
        if (S.kos) for (let k = 0; k < 6; k++) { const d = dt / 6, x = S.xr, sl = (RYs(x + 0.01) - RYs(x - 0.01)) / 0.02, cs = 1 / Math.sqrt(1 + sl * sl);
          let a = -g * sl * cs; if (x > 2.5 && x < 4 && S.fr) a -= Math.sign(S.vr) * 0.3 * g; S.vr += a * d; const dx = S.vr * cs * d * 0.5; S.xr += dx; if (x > 2.5 && x < 4 && S.fr) S.Q += 0.3 * S.mr * g * Math.abs(dx) * 2; if (S.xr > 3.95) { S.xr = 3.95; S.vr = 0; S.kos = 0; } if (Math.abs(S.vr) < 0.02 && x > 2.5) { S.kos = 0; S.vr = 0; } }
        const y = RYs(S.xr), sl = (RYs(S.xr + 0.01) - RYs(S.xr - 0.01)) / 0.02; o.vg.position.set(S.xr, y, 0); o.vg.rotation.z = Math.atan(sl);
        const hm = (y - 0.35) * 10, E0 = S.mr * g * h0 * 10, Ep = S.mr * g * hm, Ek = Math.max(0, E0 - Ep - S.Q);
        [Ek, Ep, S.Q].forEach((E, i) => { const L = Math.max(0.01, E / E0 * 2); o.bar[i].scale.y = L; o.bar[i].position.y = 1.6 + L / 2; FZ.show('k4b' + i, V3(1.6 + i * 0.45, 1.35, -1.2), 1); });
        FZ.setTag('k4K', `E<sub>k</sub> ${Math.round(Ek)} J · E<sub>p</sub> ${Math.round(Ep)} J · ısı ${Math.round(S.Q)} J (h<sub>0</sub> = ${Math.round(h0 * 10)} m, m = ${S.mr} kg)`); FZ.show('k4K', V3(0.4, 4.4, 0), 1);
      }
    },
    qp: () => V3(0.4, 4, 0) });
  const md = (S, mod, x) => Object.assign(S, { mod, kos: 0 }, x || {});
  const yolK = (S, x1, v1, a1, x2, v2, a2, tson = 6) => md(S, 'yol', { x1, v1, a1, x2, v2, a2, tk: 0, iz: [[], []], tson });
  const kutuK = (S, F, m, mus, muk, sp = 0) => md(S, 'kutu', { F, m, mus, muk, sp, xk: 0, vk: 0 });
  const rayK = (S, fr) => md(S, 'ray', { xr: -3.9, vr: 0, Q: 0, fr });

  const h1 = ders(sHk, { yk: 'TYT3-d4', no: 4, icon: '🚙', name: 'Hikâye: Okul yolunda iki araba', task: 'Konum, yol, yer değiştirme, sürat–hız, düzgün doğrusal hareket, konum–zaman grafiği, karşılaşma.', notlar: ['x = v · t (düzgün doğrusal hareket) · konum–zaman grafiğinin eğimi hızdır.', 'Yol skaler, yer değiştirme vektördür.'], steps: [
    { do: S => yolK(S, 0, 10, 0, 60, -5, 0, 4), sub: 'Sabah Ece\'nin babası kırmızı arabayla (sol) okula gidiyor, karşıdan mavi bir araba geliyor. Panoda konum–zaman grafiği çizilecek.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Konum, yol ve yer değiştirme', m: ['Konum: başlangıç noktasına göre yer (+/− yönlü). Yer değiştirme: son konum − ilk konum (vektör). Yol: gidilen toplam uzunluk (skaler).', `Sürat = ${F('yol', 'zaman')} · hız = ${F('yer değiştirme', 'zaman')}`] } },
    { p: { t: 'Kırmızı araba 0 m\'den 10 m/s ile, mavi 60 m\'den 5 m/s ile birbirine doğru gidiyor. Kaçıncı saniyede karşılaşırlar?', o: ['6', '4', '3', '12'], d: 1 } },
    { do: S => { S.kos = 1; }, sub: 'Arabalar ilerliyor; grafik çiziliyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Karşılaşma = grafiklerin kesişmesi', f: ['k4P', 'k4K'], m: [`Aradaki uzaklık her saniye 10 + 5 = 15 m kapanır: ${FM(`t = ${F('60', '15')}`)} = <em>4 s</em> (40 m\'de).`, 'Grafikte iki doğrunun kesiştiği an karşılaşma anıdır.'] } },
    { k: { tur: 'kavram', b: 'Düzgün doğrusal hareket', m: [`${FM('x = v · t')} · konum–zaman grafiği doğrudur, <em>eğimi hızdır</em>.`, 'Eğimi negatif doğru: araç (−) yönde gidiyor (mavi araba). Yatay doğru: duruyor.'] } },
    { do: S => yolK(S, 0, 0, 4, 0, 10, 0, 5), sub: 'Okul çıkışı: kırmızı araba durgun halden 4 m/s² ivmeyle kalkıyor, mavi araba yanından 10 m/s ile geçiyor.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Kırmızı araba hızlanıyor…', until: S => !S.kos },
    { k: { tur: 'kavram', b: 'Düzgün hızlanan hareket', f: ['k4P'], m: [`${FM('v = v<sub>0</sub> + a t')} · ${FM(`x = v<sub>0</sub> t + ${F('1', '2')} a t<sup>2</sup>`)}`, 'Konum–zaman grafiği eğri olur; eğimi (hız) giderek artar. Kırmızı araba 5 s\'de mavi arabaya yetişir: 2t² = 10t → t = 5 s.'] } },
    { k: { tur: 'dikkat', b: 'UYARI · Grafik okuma', m: ['x–t grafiğinde eğim hız, v–t grafiğinde eğim ivme, v–t grafiğinin altındaki alan yer değiştirmedir.', 'Hız ile ivme aynı yönlüyse hızlanır, zıt yönlüyse yavaşlar.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('x = v t')} · karşılaşma ${FM(`t = ${F('d', 'v<sub>1</sub> + v<sub>2</sub>')}`)} · yetişme ${FM(`t = ${F('d', 'v<sub>1</sub> − v<sub>2</sub>')}`)}`] } },
  ] });
  const h2 = ders(sHk, { yk: 'TYT3-d5', no: 5, icon: '📦', name: 'Hikâye: Taşınma günü — koliyi itmek', task: 'Kuvvet, net kuvvet, eylemsizlik, F = ma, etki–tepki, statik ve kinetik sürtünme.', notlar: ['Statik sürtünme en çok μs·N; kayınca kinetik sürtünme μk·N (genelde daha küçük).', 'Sürtünme kuvveti harekete (ya da hareket eğilimine) zıttır.'], steps: [
    { do: S => kutuK(S, 0, 5, 0.4, 0.3), sub: 'Ece\'nin ailesi taşınıyor. 5 kg\'lık bir koli halının (koyu bölge) üstüne itilecek.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Kuvvetler', f: ['k4g', 'k4N'], m: ['Koliye ağırlık (mg) düşey aşağı, zeminin tepki kuvveti (N) yüzeyden koliye, yukarı etki eder. Dengede eşittirler ama etki–tepki çifti değildir.'] } },
    { do: S => kutuK(S, 20, 5, 0.4, 0.3), sub: 'Ece sürtünmesiz parkede koliyi 20 N ile itiyor…', go: '▶︎ İt' },
    { do: S => { S.kos = 1; }, sub: 'Koli hızlanıyor…', until: S => S.xk > 2.3 },
    { k: { tur: 'kavram', b: 'F = m · a', f: ['k4K'], m: [`${FM('F<sub>net</sub> = m · a')} → a = 20 / 5 = 4 m/s² (parkede).`, 'Halıya girince sürtünme başlar: f<sub>k</sub> = μ<sub>k</sub> · N = 0,3 · 50 = 15 N → a = (20 − 15) / 5 = 1 m/s².'] } },
    { do: S => { S.kos = 1; }, sub: 'Koli halıda…', until: S => !S.kos },
    { do: S => kutuK(S, 15, 5, 0.4, 0.3), sub: 'Şimdi koli halının ortasında duruyor; Ece 15 N ile itiyor.', wait: 0.1 },
    { do: S => { S.xk = 3.5; S.vk = 0; }, p: { t: 'Halıda duran koliye (μ<sub>s</sub> = 0,4) 15 N kuvvet uygulanırsa ne olur?', o: ['Kayar, a = 3 m/s²', 'Kımıldamaz; sürtünme 15 N', 'Kımıldamaz; sürtünme 20 N', 'Kayar, a = 0'], d: 1, b: ['Koli: m = 5 kg, g = 10 m/s² → N = mg = 50 N', 'Halıda μ<sub>s</sub> = 0,4 · μ<sub>k</sub> = 0,3 · uygulanan kuvvet F = 15 N', 'Kayması için F, en büyük statik sürtünmeyi (f<sub>s,max</sub> = μ<sub>s</sub> · N) aşmalı.'] } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Statik sürtünme', f: ['k4f'], m: ['f<sub>s,max</sub> = 0,4 · 50 = 20 N > 15 N → koli kımıldamaz; sürtünme kuvvet kadar, <em>15 N</em>.', 'Statik sürtünme sabit değildir: 0\'dan f<sub>s,max</sub>\'a kadar uygulanan kuvvete eşit olur.'] } },
    { k: { tur: 'kavram', b: 'Newton\'un üç yasası', m: ['1. Eylemsizlik: net kuvvet sıfırsa durur ya da sabit hızla gider.', '2. F<sub>net</sub> = m a · 3. Etki–tepki: Ece koliyi iterken koli de Ece\'yi eşit ve zıt kuvvetle iter (farklı cisimlere etki eder).'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('F<sub>net</sub> = m a')} · ${FM('f<sub>k</sub> = μ<sub>k</sub> N')} · f<sub>s</sub> ≤ μ<sub>s</sub> N · etki–tepki farklı cisimlerde.`] } },
  ] });
  const h3 = ders(sHk, { yk: 'TYT4-d3', no: 3, icon: '🎢', name: 'Hikâye: Lunaparkta enerji treni', task: 'Kinetik ve potansiyel enerji, mekanik enerjinin korunumu, sürtünmede ısıya dönüşüm, iş ve güç.', notlar: ['Ek = ½mv² · Ep = mgh · sürtünmesiz yolda Ek + Ep sabit.', 'Sürtünme kuvvetinin işi ısıya dönüşür: Q = f · s.'], steps: [
    { do: S => rayK(S, 0), sub: 'Ece lunaparkta. 2 kg\'lık oyuncak vagon 26 m yükseklikten durgun bırakılacak (ölçekli model).', go: '▶︎ Vagonu bırak' },
    { do: S => { S.kos = 1; }, sub: 'Vagon iniyor; enerji çubukları değişiyor…', until: S => S.xr > 1.9 || !S.kos },
    { k: { tur: 'kavram', b: 'Enerji dönüşümü', f: ['k4b0', 'k4b1'], m: [`${FM('E<sub>p</sub> = m g h')} yükseklikten, ${FM(`E<sub>k</sub> = ${F('1', '2')} m v<sup>2</sup>`)} hızdan gelir.`, 'İnerken E<sub>p</sub> azalır, E<sub>k</sub> artar; sürtünme yoksa toplamları sabittir.'] } },
    { k: { tur: 'ornek', b: 'Küçük örnek', m: ['En alçak noktada (h ≈ 0) bütün enerji kinetiktir: ½ · 2 · v² = 2 · 10 · 26 → v ≈ 23 m/s.', 'Hız kütleye bağlı değil: ağır vagon da aynı hızla iner.'] } },
    { do: S => rayK(S, 1), sub: 'Şimdi rayın sonuna fren bölgesi (koyu) açıldı.', go: '▶︎ Tekrar bırak' },
    { do: S => { S.kos = 1; }, sub: 'Vagon fren bölgesinde yavaşlıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Enerji kaybolmaz, ısıya dönüşür', f: ['k4b2', 'k4K'], m: ['Fren bölgesinde sürtünme kuvveti iş yaptı: kinetik enerji <em>ısıya</em> dönüştü. Toplam enerji korundu.', `${FM('W = F · x')} · ${FM(`P = ${F('W', 't')}`)} (güç: birim zamanda yapılan iş, watt).`] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['E<sub>k</sub> + E<sub>p</sub> + ısı = sabit · iş = kuvvet × yol · güç = iş / zaman.'] } },
  ] });

  const g1 = gorev(sHk, { yk: 'TYT3-g5', no: 5, icon: '🛣️', name: 'Soru sistemi: doğrusal hareket ve grafikler', task: 'Konum–zaman, hız–zaman grafikleri, karşılaşma, yetişme, sürat–hız, ortalama hız.', steps: [
    { do: S => yolK(S, 0, 10, 0, 60, -5, 0, 4), sub: 'İki araba.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'K aracı x = 0\'dan +10 m/s, L aracı x = 60 m\'den −5 m/s ile sabit hızla hareket ediyor. Karşılaştıkları konum kaç m\'dir?', o: ['40', '30', '20', '60'], f: ['k4P'],
      s: ['t = 60 / (10 + 5) = 4 s', 'x = 10 · 4 = <em>40 m</em> ✓'], n: ['Konum–zaman grafiklerinin kesiştiği nokta.'] } },
    { do: S => yolK(S, 0, 0, 4, 0, 10, 0, 5), q: { t: 'Durgun K aracı 4 m/s² ivmeyle kalkarken yanından L aracı 10 m/s sabit hızla geçiyor. K, L\'ye kaçıncı saniyede yetişir?', o: ['5', '2,5', '10', '4'],
      s: ['2t² = 10t → <em>t = 5 s</em> ✓'], n: ['Yetiştiği anda K\'nin hızı 20 m/s, L\'ninkinin 2 katıdır.'] } },
    { q: { t: 'Konum–zaman grafiği yatay doğru olan bir araç için hangisi doğrudur?', o: ['Durmaktadır', 'Sabit hızla gitmektedir', 'Düzgün hızlanmaktadır', 'Geri dönmektedir'],
      s: ['Eğim = hız = 0 → <em>duruyor</em> ✓'], n: ['Hız–zaman grafiğinde yatay doğru ise sabit hız demektir. Eksenlere dikkat!'] } },
    { q: { t: 'Bir koşucu doğuya 40 m, sonra batıya 10 m koşmayı 10 s\'de tamamlıyor. Ortalama sürati ve ortalama hızının büyüklüğü kaç m/s\'dir?', o: ['5 ve 3', '3 ve 5', '5 ve 5', '4 ve 3'],
      s: ['Yol 50 m → sürat 5 m/s', 'Yer değiştirme 30 m (doğu) → hız <em>3 m/s</em> ✓'], n: ['Sürat ≥ hızın büyüklüğü.'] } },
    { q: { t: 'Hız–zaman grafiği (0, 0) noktasından (4 s, 20 m/s) noktasına giden doğru olan aracın 0–4 s aralığındaki yer değiştirmesi kaç m\'dir?', o: ['40', '80', '20', '5'],
      s: ['v–t grafiğinin altındaki alan: ½ · 4 · 20 = <em>40 m</em> ✓', 'İvme = eğim = 5 m/s².'], n: ['v–t alan = yer değiştirme; v–t eğim = ivme.'] } },
    { q: { t: 'Paralel raylarda aynı yöne giden 200 m uzunluğundaki X treni 25 m/s, 100 m uzunluğundaki Y treni 15 m/s hızla gidiyor. X, Y\'yi arkadan yakaladığı andan tamamen geçene kadar kaç s geçer?', o: ['30', '20', '10', '7,5'],
      s: ['Göreli hız 25 − 15 = 10 m/s', 'Alınacak göreli yol 200 + 100 = 300 m → <em>30 s</em> ✓'], n: ['Geçme problemlerinde iki trenin boyu toplanır.'] } },
  ] });
  const g2 = gorev(sHk, { yk: 'TYT3-g6', no: 6, icon: '📦', name: 'Soru sistemi: Newton yasaları ve sürtünme', task: 'Net kuvvet, F–a, statik–kinetik sürtünme, farklı yüzeyler, makaralı sistemler, etki–tepki.', data: [['g', '10 m/s²']], steps: [
    { do: S => kutuK(S, 20, 5, 0.4, 0.3), sub: '5 kg\'lık koli.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'Sürtünmesiz yatay düzlemde 5 kg\'lık koliye 20 N yatay kuvvet uygulanıyor. İvmesi kaç m/s²\'dir?', o: ['4', '100', '0,25', '20'], f: ['k4F', 'k4K'],
      s: ['a = F / m = 20 / 5 = <em>4 m/s²</em> ✓'], n: ['Ağırlık ve tepki dengededir; hareketi yatay net kuvvet belirler.'] } },
    { do: S => { kutuK(S, 15, 5, 0.4, 0.3); S.xk = 3.5; }, q: { t: 'μ<sub>s</sub> = 0,4 ve μ<sub>k</sub> = 0,3 olan zeminde duran 5 kg\'lık koliye 15 N yatay kuvvet uygulanıyor. Sürtünme kuvveti kaç N\'dur?', o: ['15', '20', '0', '5'], f: ['k4f'],
      s: ['f<sub>s,max</sub> = 0,4 · 50 = 20 N > 15 N → kaymaz', 'Statik sürtünme = <em>15 N</em> ✓'], n: ['"μN" her zaman sürtünme değildir; cisim kaymıyorsa sürtünme uygulanan kuvvete eşittir.'] } },
    { do: S => { kutuK(S, 30, 5, 0.4, 0.3); S.xk = 3.5; S.kos = 1; }, q: { t: 'Aynı koliye 30 N kuvvet uygulanırsa ivmesi kaç m/s² olur?', o: ['3', '6', '2', '4'], f: ['k4f', 'k4K'],
      s: ['30 > 20 → kayar; f<sub>k</sub> = 0,3 · 50 = 15 N', 'a = (30 − 15) / 5 = <em>3 m/s²</em> ✓'], n: ['Kayan cisme kinetik sürtünme etki eder.'] } },
    { q: { t: 'Aynı koli sırasıyla tahta, beton ve buz zeminde aynı hızla kayarken sürtünme kuvvetleri f<sub>T</sub>, f<sub>B</sub>, f<sub>Z</sub>. Sürtünme katsayıları beton > tahta > buz ise ilişki nedir?', o: ['f<sub>B</sub> > f<sub>T</sub> > f<sub>Z</sub>', 'f<sub>T</sub> = f<sub>B</sub> = f<sub>Z</sub>', 'f<sub>Z</sub> > f<sub>T</sub> > f<sub>B</sub>', 'f<sub>T</sub> > f<sub>B</sub> > f<sub>Z</sub>'],
      s: ['f<sub>k</sub> = μ<sub>k</sub> N; N aynı (mg).', 'μ büyükse f büyük → <em>f<sub>B</sub> > f<sub>T</sub> > f<sub>Z</sub></em> ✓'], n: ['Kinetik sürtünme hıza ve yüzey alanına bağlı değildir.'] } },
    { q: { t: 'Kuvvet–ivme grafiğinde K\'nin doğrusu 4 N\'da 2 m/s², L\'ninki 4 N\'da 1 m/s² gösteriyor. m<sub>K</sub>/m<sub>L</sub> oranı kaçtır?', o: [F('1', '2'), '2', '1', '4'],
      s: ['m = F / a: m<sub>K</sub> = 2 kg, m<sub>L</sub> = 4 kg', `${F('m<sub>K</sub>', 'm<sub>L</sub>')} = <em>${F('1', '2')}</em> ✓`], n: ['F–a grafiğinin eğimi kütledir; a–F grafiğinde eğim 1/m.'] } },
    { q: { t: 'Sürtünmesiz masadaki 3 kg\'lık cisim, makaradan geçen iple 2 kg\'lık asılı cisme bağlı. Sistemin ivmesi kaç m/s²\'dir?', o: ['4', '2', '10', '6,7'],
      s: ['Sistemi hareket ettiren asılı cismin ağırlığı: 20 N', 'a = 20 / (3 + 2) = <em>4 m/s²</em> ✓', 'İp gerilmesi T = 3 · 4 = 12 N (asılı cismin ağırlığından küçük).'], n: ['İp gerilmesi asılı cismin ağırlığına eşit değildir; sistem ivmeliyse daha küçüktür.'] } },
    { q: { t: 'Masa üzerinde duran kitap için;<br>I. Kitabın ağırlığı ile masanın kitaba tepkisi etki–tepki çiftidir.<br>II. Kitabın masaya uyguladığı kuvvet ile masanın kitaba uyguladığı kuvvet etki–tepki çiftidir.<br>III. Kitaba etki eden net kuvvet sıfırdır.<br>yargılarından hangileri doğrudur?', o: ['II ve III', 'Yalnız I', 'I ve III', 'I, II ve III'],
      s: ['I yanlış: ikisi de kitaba etki eder (denge çifti).', 'II doğru (farklı cisimler) · III doğru → <em>II ve III</em> ✓'], n: ['Ağırlığın tepkisi kitabın Dünya\'yı çekmesidir.'] } },
  ] });
  const g3 = gorev(sHk, { yk: 'TYT4-g3', no: 3, icon: '🎢', name: 'Soru sistemi: enerji, iş, güç', task: 'Ek–Ep oranları, enerji korunumu, sürtünmeyle ısı, enerji–konum grafiği, iş ve güç, verim.', data: [['g', '10 m/s²']], steps: [
    { do: S => rayK(S, 0), sub: 'Raylı yol.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'Sürtünmesiz rayda 2 kg\'lık vagon 20 m yükseklikten durgun bırakılıyor. 5 m yükseklikteki noktada kinetik enerjisi kaç J\'dür?', o: ['300', '100', '400', '200'], f: ['k4b0', 'k4b1'],
      s: ['E<sub>k</sub> = mg(h<sub>0</sub> − h) = 2 · 10 · 15 = <em>300 J</em> ✓'], n: ['Sürtünmesiz yolda mekanik enerji korunur.'] } },
    { q: { t: 'Aynı vagonun 5 m yükseklikteki noktada kinetik enerjisinin potansiyel enerjisine oranı kaçtır?', o: ['3', '1/3', '4', '1'],
      s: ['E<sub>k</sub> = 300 J, E<sub>p</sub> = 2 · 10 · 5 = 100 J', 'Oran = <em>3</em> ✓'], n: ['Oran (h<sub>0</sub> − h)/h ile de bulunur: 15/5.'] } },
    { do: S => rayK(S, 1), q: { t: 'Vagon sonradan fren bölgesinde duruyor. Bölgede sürtünme kuvveti 50 N ise vagon (yerde, 20 m yükseklikten bırakılmış) kaç m sonra durur?', o: ['8', '4', '20', '40'], f: ['k4b2'],
      s: ['Bütün enerji ısıya: mgh = f · s → 400 = 50 · s', '<em>s = 8 m</em> ✓'], n: ['Sürtünme kuvvetinin işi negatiftir; mekanik enerji ısıya dönüşür.'] } },
    { q: { t: 'Yerden 2 m yükseklikten bırakılan top yere çarpıp en çok 1,5 m yükseliyor. Çarpmada mekanik enerjisinin yüzde kaçını kaybetmiştir? (Hava direnci yok)', o: ['25', '75', '50', '15'],
      s: ['Kayıp = mg(2 − 1,5) / mg · 2 = 0,5 / 2', '<em>%25</em> ✓'], n: ['Kaybolan enerji ısıya ve sese dönüşür.'] } },
    { q: { t: '600 N ağırlığındaki Ahmet 3 m yüksekliğindeki merdiveni 4 s\'de, Mehmet (600 N) aynı merdiveni 6 s\'de çıkıyor. Hangisi doğrudur?', o: ['İşleri eşit, Ahmet\'in gücü büyük', 'Ahmet daha çok iş yapar', 'Güçleri eşit', 'Mehmet\'in gücü büyük'],
      s: ['W = mgh = 1800 J ikisinde de.', 'P = W/t → Ahmet 450 W, Mehmet 300 W ✓'], n: ['İş süreye bağlı değildir; güç süreye bağlıdır.'] } },
    { q: { t: 'Gücü 2 kW olan bir motor 200 kg\'lık yükü 10 s\'de 8 m yükseltiyor. Motorun verimi yüzde kaçtır?', o: ['80', '100', '40', '60'],
      s: ['Yararlı iş = 200 · 10 · 8 = 16 000 J', 'Harcanan = 2000 · 10 = 20 000 J → verim <em>%80</em> ✓'], n: ['Verim her zaman %100\'den küçüktür.'] } },
  ] });

  // ======================= TUZAK SORULAR (her konunun en sonunda) =======================
  const t1 = gorev(sHk, { yk: 'TYT3-g7', no: 7, tuzak: true, icon: '🪤', name: 'Tuzak sorular · hareket ve kuvvet', task: 'Sınavda en çok yapılan hareket ve Newton yanlışları.', data: [['g', '10 m/s²']], steps: [
    { do: S => kutuK(S, 0, 5, 0.4, 0.3), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: 'Sabit hızla düz yolda giden bir arabaya etki eden net kuvvet için hangisi doğrudur?', o: ['Sıfırdır', 'Hareket yönündedir', 'Harekete zıttır', 'Hızla orantılıdır'],
      s: ['Sabit hız → ivme 0 → F<sub>net</sub> = <em>0</em> ✓ (motorun itişi ile sürtünme–hava direnci dengede)'], n: ['TUZAK: "Hareket varsa hareket yönünde net kuvvet vardır" düşüncesi.'] } },
    { q: { t: 'Yukarı atılan top en tepe noktasındayken (hava direnci yok) için hangisi doğrudur?', o: ['Hızı sıfır, ivmesi g (aşağı)', 'Hızı ve ivmesi sıfır', 'Hızı sıfır, net kuvvet sıfır', 'İvmesi yukarı yönlü'],
      s: ['Tepede an hız sıfır; ağırlık hâlâ etki eder → a = g, <em>aşağı</em> ✓'], n: ['TUZAK: "Durduysa ivmesi de sıfırdır" sanmak.'] } },
    { do: S => { kutuK(S, 10, 5, 0.4, 0.3); S.xk = 3.5; }, q: { t: 'μ<sub>s</sub> = 0,4 olan zeminde duran 5 kg\'lık kutuya 10 N yatay kuvvet uygulanıyor. Sürtünme kuvveti kaç N\'dur?', o: ['10', '20', '15', '0'], f: ['k4f'],
      s: ['20 N\'a kadar kaymaz; sürtünme uygulanan kuvvete eşit: <em>10 N</em> ✓'], n: ['TUZAK: μN = 20 N yazmak.'] } },
    { q: { t: 'Atın arabayı çektiği kuvvet ile arabanın atı çektiği kuvvet eşit ve zıt olduğuna göre sistem nasıl hareket eder?', o: ['Atın ayaklarına yerden gelen sürtünme kuvveti sistemi hızlandırır', 'Kuvvetler birbirini götürdüğü için hareket edemez', 'At daha büyük kuvvet uyguladığı için', 'Araba atı ittiği için'],
      s: ['Etki–tepki kuvvetleri farklı cisimlere etki eder; birbirini götürmez.', 'Sisteme dışarıdan etki eden net kuvvet yerin sürtünmesidir ✓'], n: ['TUZAK: etki–tepkiyi aynı cisme uygulamak.'] } },
    { q: { t: 'Bir araç 1 saat 60 km/h, sonraki 1 saat 100 km/h hızla aynı yönde gidiyor. Ortalama hızı kaç km/h\'tir?', o: ['80', '75', '160', '70'],
      s: ['Yol 160 km, süre 2 h → <em>80 km/h</em> ✓'], n: ['Burada süreler eşit olduğu için ortalama doğru çıkar; yollar eşit olsaydı (60 ve 100 km/h ile eşit yollar) ortalama 75 km/h olurdu.'] } },
    { q: { t: 'Asansörde duran 50 kg\'lık kişi için asansör sabit hızla yukarı çıkarken tabanın kişiye tepkisi kaç N\'dur?', o: ['500', '550', '450', '0'],
      s: ['Sabit hız → ivme 0 → N = mg = <em>500 N</em> ✓'], n: ['TUZAK: "Yukarı çıkıyorsa ağır basar" demek. Yalnız ivmelenirken değişir.'] } },
  ] });
  const t2 = gorev(sHk, { yk: 'TYT4-g4', no: 4, tuzak: true, icon: '🪤', name: 'Tuzak sorular · enerji', task: 'İş, enerji ve güç konusunda en sık yapılan yanlışlar.', data: [['g', '10 m/s²']], steps: [
    { do: S => rayK(S, 0), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: 'Elinde 10 kg\'lık çantayla 20 m yatay yolda sabit hızla yürüyen kişinin çantayı taşıyan kuvvetinin yaptığı iş kaç J\'dür?', o: ['0', '2000', '200', '100'],
      s: ['Kuvvet yukarı, yer değiştirme yatay (90°) → <em>iş 0</em> ✓'], n: ['TUZAK: yorulmayı iş sanmak.'] } },
    { q: { t: 'Aynı yükseklikten sürtünmesiz farklı eğimli iki rampadan bırakılan özdeş cisimlerin tabandaki hızları için hangisi doğrudur?', o: ['Eşittir', 'Dik rampada büyüktür', 'Uzun rampada büyüktür', 'Kütleye bağlıdır'],
      s: ['mgh = ½mv² → v = √(2gh), yalnız h\'ye bağlı → <em>eşit</em> ✓ (süreler farklı)'], n: ['TUZAK: dik rampada daha hızlı varır sanmak; daha kısa sürede varır ama aynı hızla.'] } },
    { q: { t: 'Hızı 2 katına çıkan cismin kinetik enerjisi kaç katına çıkar?', o: ['4', '2', '8', '√2'],
      s: ['E<sub>k</sub> ∝ v² → <em>4 katı</em> ✓'], n: ['TUZAK: doğru orantı sanmak.'] } },
    { q: { t: 'Sürtünmeli yolda yavaşlayıp duran bir cismin enerjisi için hangisi doğrudur?', o: ['Kinetik enerji ısıya dönüşür; toplam enerji korunur', 'Enerji yok olur', 'Kinetik enerji potansiyele dönüşür', 'Mekanik enerji korunur'],
      s: ['Sürtünmenin işi kinetik enerjiyi ısıya çevirir. Enerji yok olmaz ✓'], n: ['TUZAK: "Enerji kayboldu" demek; mekanik enerji azalır, toplam enerji korunur.'] } },
    { q: { t: 'Güç birimi olan watt hangisine eşittir?', o: ['J/s', 'J · s', 'N · m', 'kWh'],
      s: ['P = W / t → <em>J/s</em> ✓', 'kWh ve N·m (J) enerji birimidir.'], n: ['TUZAK: kWh\'yi güç birimi sanmak.'] } },
  ] });
  (FZ.SAHNE = FZ.SAHNE || {}).hareket = sHk;   // kitap soru bankaları (kitap10.js) bu düzeneği kullanır
  FZ.konuEk('TYT', 'Hareket ve Kuvvet', { dersler: [h1, h2], gorevler: [g1, g2, t1] });
  FZ.konuEk('TYT', 'Enerji', { dersler: [h3], gorevler: [g3, t2] });
})();
