// Animasyon programı · Kuvvet ve Newton Yasaları Laboratuvarı (bileşke, eylemsizlik, F = ma, etki–tepki, sürtünme)
// ve Hareket Laboratuvarı (yol–yer değiştirme, sürat–hız, karşılaşma, yetişme)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const KN = 0.025;   // kuvvet ölçeği: 1 N = 0,025 birim (gerçek oranlı oklar)
  const KV = 0.5;     // hız ölçeği: 1 m/s = 0,5 birim
  const insan = (g, renk, boy) => { const a = new THREE.Group(); g.add(a);
    silindir(a, 0.09 * boy, 0.09 * boy, 0.75 * boy, 0x1f2937, -0.12 * boy, 0.38 * boy, 0, { edge: false }); silindir(a, 0.09 * boy, 0.09 * boy, 0.75 * boy, 0x1f2937, 0.12 * boy, 0.38 * boy, 0, { edge: false });
    silindir(a, 0.26 * boy, 0.22 * boy, 0.8 * boy, renk, 0, 1.15 * boy, 0, { edge: false }); top(a, 0.18 * boy, 0xf1c27d, 0, 1.75 * boy, 0, { edge: false });
    kutu(a, 0.5 * boy, 0.05, 0.14, 0x94a3b8, 0, 0.03, 0, { edge: false }); return a; };

  // =====================================================================
  // NEWTON LABORATUVARI: kutu (bileşke, F = ma, sürtünme) · patenciler (etki–tepki) · disk (eylemsizlik) · iki araba (F = ma)
  // =====================================================================
  const sNw = sahne({ icon: '🧊', cam: [[0.9, 3.6, 12], [0.9, 1.2, 0]], plate: [12, 4, 0, 0], data: [['g', '10 m/s²']],
    S0: () => ({ mod: 'kutu', m: 5, F1: 20, F2: 0, mus: 0, muk: 0, x: -2.5, v: 0, kos: 0, tp: 0, m1: 40, m2: 80, Fp: 100, x1: -0.45, x2: 0.45, v1: 0, v2: 0, d1: -2.8, d2: -2.8, dv1: 3, dv2: 3, ma: 1, mb: 2, xa: -3.5, xb: -3.5, ta: 0 }),
    kur(g) {
      const G = {}; ['kutu', 'paten', 'disk', 'araba'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      const kut = kutu(G.kutu, 1, 1, 1, 0xd97706, 0, 0.5, 0);
      const zemin = kutu(G.kutu, 9, 0.02, 1.6, 0x9ca3af, 0, 0.01, 0, { edge: false });
      const buz = kutu(G.paten, 9, 0.02, 2.4, 0xe0f2fe, 0, 0.01, 0, { edge: false });
      const p1 = insan(G.paten, 0xdc2626, 0.9), p2 = insan(G.paten, 0x2563eb, 1.1);
      const seritB = kutu(G.disk, 9, 0.02, 1, 0xe0f2fe, 0, 0.01, 0.75, { edge: false }), seritH = kutu(G.disk, 9, 0.02, 1, 0x7f1d1d, 0, 0.01, -0.75, { edge: false });
      const dB = silindir(G.disk, 0.35, 0.35, 0.18, 0x111827, 0, 0.1, 0.75), dH = silindir(G.disk, 0.35, 0.35, 0.18, 0x111827, 0, 0.1, -0.75);
      kutu(G.araba, 9, 0.04, 2.6, 0x94a3b8, 0, 0.02, 0, { edge: false });
      const aA = FZ.labArabasi(G.araba, 0xdc2626, 1), aB = FZ.labArabasi(G.araba, 0x2563eb, 1);
      const O = { F1: ok(0x16a34a, 'nwF1'), F2: ok(0x7c3aed, 'nwF2'), f: ok(0xdc2626, 'nwf'), mg: ok(0x475569, 'nwmg'), N: ok(0x0ea5e9, 'nwN'), v: ok(0x111827, 'nwv'),
        p1: ok(0x16a34a, 'nwP1'), p2: ok(0x16a34a, 'nwP2'), pv1: ok(0x111827, 'nwV1'), pv2: ok(0x111827, 'nwV2'), fh: ok(0xdc2626, 'nwfh'), vb: ok(0x111827, 'nwvb'), vh: ok(0x111827, 'nwvh'), Fa: ok(0x16a34a, 'nwFa'), Fb: ok(0x16a34a, 'nwFb') };
      [['nwF1', 'F<sub>1</sub>', '#16a34a'], ['nwF2', 'F<sub>2</sub>', '#7c3aed'], ['nwf', 'f<sub>s</sub>', '#dc2626'], ['nwmg', 'mg', '#475569'], ['nwN', 'N', '#0284c7'], ['nwv', 'v', '#111827'],
        ['nwP1', 'F', '#16a34a'], ['nwP2', 'F', '#16a34a'], ['nwV1', 'v<sub>1</sub>', '#111827'], ['nwV2', 'v<sub>2</sub>', '#111827'], ['nwfh', 'f<sub>s</sub>', '#dc2626'], ['nwvb', 'v', '#111827'], ['nwvh', 'v', '#111827'], ['nwFa', '10 N', '#16a34a'], ['nwFb', '10 N', '#16a34a']].forEach(([id, h, c]) => etiket(id, h, c));
      kart('nwT', '', '#F5C400'); etiket('nwA', '', '#b45309'); etiket('nwB', '', '#1d4ed8'); etiket('nwC', '', '#334155');
      return { G, kut, p1, p2, dB, dH, aA, aB, O };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      Object.values(o.O).forEach(a => a.visible = false);
      const A = (a, p, d, L, id, op = 1) => { if (L < 0.02) return; FZ.setArrow(a, p, d, L); FZ.show(id, p.clone().add(d.clone().normalize().multiplyScalar(L + 0.25)), op); };
      if (S.mod === 'kutu') {
        const mg = S.m * 10, net = S.F1 - S.F2; let f = 0, a = 0;
        if (S.kos) { if (S.v === 0 && Math.abs(net) <= S.mus * mg) { f = -net; a = 0; }
          else { const yon = S.v !== 0 ? Math.sign(S.v) : Math.sign(net); f = -yon * S.muk * mg; a = (net + f) / S.m; const v0 = S.v; S.v += a * dt; if (v0 !== 0 && Math.sign(S.v) !== Math.sign(v0) && S.muk > 0 && Math.abs(net) <= S.mus * mg) S.v = 0; }
          S.x += S.v * dt * 0.5; if (S.x > 3.6 || S.x < -3.6) { S.x = Math.max(-3.6, Math.min(3.6, S.x)); S.kos = 0; } }
        else if (S.v === 0 && S.mus > 0) f = -Math.max(-S.mus * mg, Math.min(S.mus * mg, net));
        S.a = a; S.f = f;
        o.kut.position.x = S.x; o.kut.scale.setScalar(0.75 + S.m * 0.05); const h = 0.75 + S.m * 0.05; o.kut.position.y = h / 2;
        const c = V3(S.x, h / 2, 0.55);
        A(o.O.F1, V3(S.x + h / 2, h / 2, 0.55), V3(1, 0, 0), S.F1 * KN, 'nwF1'); A(o.O.F2, V3(S.x - h / 2, h / 2, 0.55), V3(-1, 0, 0), S.F2 * KN, 'nwF2');
        A(o.O.f, V3(S.x + (Math.sign(f) || 1) * h / 2, 0.06, 0.6), V3(Math.sign(f) || 1, 0, 0), Math.abs(f) * KN, 'nwf');   /* sürtünme temas yüzeyinde, okun tamamı görünsün diye kenardan */
        A(o.O.mg, c, V3(0, -1, 0), mg * KN, 'nwmg'); A(o.O.N, V3(S.x + 0.15, 0.02, 0.6), V3(0, 1, 0), mg * KN, 'nwN');
        A(o.O.v, V3(S.x, h + 0.25, 0), V3(Math.sign(S.v) || 1, 0, 0), Math.abs(S.v) * KV, 'nwv');
        FZ.setTag('nwT', `F<sub>net</sub> = ${fs(net + f)} N · a = ${fs(S.a)} m/s²`); FZ.show('nwT', V3(0.4, 3.2, 0), 1);
        FZ.setTag('nwA', `m = ${S.m} kg`); FZ.show('nwA', V3(S.x, h + 0.9, 0), 1);
      } else if (S.mod === 'paten') {
        if (S.kos) { S.tp += dt; const it = S.tp < 0.5;
          if (it) { S.v1 -= S.Fp / S.m1 * dt; S.v2 += S.Fp / S.m2 * dt; }
          S.x1 += S.v1 * dt; S.x2 += S.v2 * dt; if (S.x1 < -3.8 || S.x2 > 3.8) S.kos = 0; }
        o.p1.position.x = S.x1 - 0.2; o.p2.position.x = S.x2 + 0.2; o.p1.scale.x = -1;
        const itiyor = S.kos && S.tp < 0.5;
        if (itiyor || S.goster) { A(o.O.p1, V3(S.x1 - 0.1, 1.1, 0.4), V3(-1, 0, 0), S.Fp * KN * 0.6, 'nwP1'); A(o.O.p2, V3(S.x2 + 0.1, 1.1, 0.4), V3(1, 0, 0), S.Fp * KN * 0.6, 'nwP2'); }
        A(o.O.pv1, V3(S.x1 - 0.3, 2.2, 0), V3(-1, 0, 0), Math.abs(S.v1) * KV * 2, 'nwV1'); A(o.O.pv2, V3(S.x2 + 0.3, 2.4, 0), V3(1, 0, 0), Math.abs(S.v2) * KV * 2, 'nwV2');
        FZ.setTag('nwA', `${S.m1} kg`); FZ.show('nwA', V3(S.x1 - 0.2, -0.3, 0.6), 1); FZ.setTag('nwB', `${S.m2} kg`); FZ.show('nwB', V3(S.x2 + 0.2, -0.3, 0.6), 1);
        FZ.setTag('nwT', S.tp > 0 ? `v<sub>1</sub> = ${fs(Math.abs(S.v1))} m/s · v<sub>2</sub> = ${fs(Math.abs(S.v2))} m/s` : 'Sürtünmesiz buz: birbirlerini itecekler'); FZ.show('nwT', V3(0.4, 3.3, 0), 1);
      } else if (S.mod === 'disk') {
        if (S.kos) { S.d1 += S.dv1 * dt * 0.8; if (S.dv2 > 0) { S.dv2 = Math.max(0, S.dv2 - 3 * dt); S.d2 += S.dv2 * dt * 0.8; } if (S.d1 > 2.4) S.kos = 0; }
        o.dB.position.x = S.d1; o.dH.position.x = S.d2;
        A(o.O.vb, V3(S.d1, 0.45, 0.75), V3(1, 0, 0), S.dv1 * KV * 0.7, 'nwvb'); A(o.O.vh, V3(S.d2, 0.45, -0.75), V3(1, 0, 0), S.dv2 * KV * 0.7, 'nwvh');
        if (S.dv2 > 0 && S.kos) A(o.O.fh, V3(S.d2 - 0.35, 0.1, -0.75), V3(-1, 0, 0), 0.6, 'nwfh');
        FZ.setTag('nwA', 'Buz (sürtünmesiz)'); FZ.show('nwA', V3(0.2, 0.05, 1.6), 1); FZ.setTag('nwB', 'Halı (sürtünmeli)'); FZ.show('nwB', V3(0.2, 0.8, -1.4), 1);
        FZ.setTag('nwT', S.dv2 === 0 && S.kos ? 'Halıdaki disk sürtünme yüzünden durdu; buzdaki sabit hızla gidiyor' : 'Aynı ilk hızla iki disk'); FZ.show('nwT', V3(0.4, 2.6, 0), 1);
      } else {
        if (S.kos) { S.ta = Math.min(1.2, S.ta + dt * 0.5); if (S.ta >= 1.2) S.kos = 0; }
        const aa = 10 / S.ma, ab = 10 / S.mb; S.xa = -3.5 + 0.5 * aa * S.ta * S.ta; S.xb = -3.5 + 0.5 * ab * S.ta * S.ta;
        const dxa = S.xa - o.aA.position.x, dxb = S.xb - o.aB.position.x; o.aA.position.set(S.xa, 0.04, 0.65); o.aB.position.set(S.xb, 0.04, -0.65); FZ.tekerDondur(o.aA, dxa); FZ.tekerDondur(o.aB, dxb);
        A(o.O.Fa, V3(S.xa + 0.55, 0.3, 0.65), V3(1, 0, 0), 10 * KN * 4, 'nwFa'); A(o.O.Fb, V3(S.xb + 0.55, 0.3, -0.65), V3(1, 0, 0), 10 * KN * 4, 'nwFb');
        FZ.setTag('nwA', `${S.ma} kg · a = ${fs(aa)} m/s²`); FZ.show('nwA', V3(S.xa, 1.25, 0.65), 1); FZ.setTag('nwB', `${S.mb} kg · a = ${fs(ab)} m/s²`); FZ.show('nwB', V3(S.xb, 1.1, -0.65), 1);
        FZ.setTag('nwT', `t = ${fs(S.ta)} s`); FZ.show('nwT', V3(0.4, 2.6, 0), 1);
      }
    },
    qp: () => V3(0.4, 3.6, 0) });
  const kutuK = (S, m, F1, F2, mus, muk) => Object.assign(S, { mod: 'kutu', m, F1, F2, mus, muk, x: -2.5, v: 0, kos: 0 });
  const patenK = (S, m1, m2) => Object.assign(S, { mod: 'paten', m1, m2, Fp: 100, x1: -0.45, x2: 0.45, v1: 0, v2: 0, tp: 0, kos: 0, goster: 0 });
  const diskK = S => Object.assign(S, { mod: 'disk', d1: -2.8, d2: -2.8, dv1: 3, dv2: 3, kos: 0 });
  const arabaK = S => Object.assign(S, { mod: 'araba', ma: 1, mb: 2, ta: 0, kos: 0 });

  const dNw = ders(sNw, { yk: 'TYT3-d2', no: 2, icon: '🧊', name: 'Newton yasaları laboratuvarı', task: 'Bileşke kuvvet, eylemsizlik (buz ve halı), F = ma (1 kg ve 2 kg araba), etki–tepki (patenciler), sürtünme.', steps: [
    { do: S => kutuK(S, 5, 20, 20, 0, 0), k: { tur: 'merak', b: 'Kuvvet uygulanan her cisim hareket eder mi?', m: ['Kutuya iki yandan 20 N\'luk kuvvetler uygulanıyor. Ne olur?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Bileşke kuvvet', f: ['nwF1', 'nwF2', 'nwmg', 'nwN'], m: ['Aynı doğrultuda zıt yönlü kuvvetler çıkarılır: 20 − 20 = <em>0</em>.', 'Ağırlık (mg) aşağı, zeminin tepki kuvveti (N) yukarı: düşeyde de bileşke sıfır. Kutu <em>dengede</em>.', 'Dikkat: N ile mg etki–tepki çifti değildir; ikisi de <em>aynı cisme</em> etki eder.'] } },
    { do: S => kutuK(S, 5, 20, 0, 0, 0), p: { t: 'Sürtünmesiz zeminde 5 kg kutuya yalnız 20 N uygulanırsa ivmesi kaç m/s² olur?', o: ['20', '4', '0,25', '100'], d: 1 } },
    { sub: 'Kutuyu itelim.', go: '▶︎ İt' },
    { do: S => { S.kos = 1; }, sub: 'Kutu hızlanıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'F = m · a', f: ['nwT', 'nwv'], m: [`${FM('F<sub>net</sub> = m · a')} → a = ${F('20', '5')} = <em>4 m/s²</em>. Hız düzgün arttı (v oku uzadı).`] } },
    { do: diskK, k: { tur: 'kavram', b: 'Eylemsizlik (1. yasa)', m: ['Bileşke kuvvet sıfırsa duran cisim durur, hareket eden cisim <em>sabit hızla</em> gitmeye devam eder.', 'Cismi durduran "kuvvetin bitmesi" değil, <em>sürtünme</em> gibi bir kuvvettir.'] } },
    { sub: 'İki diski aynı hızla kaydıralım.', go: '▶︎ Kaydır' },
    { do: S => { S.kos = 1; }, sub: 'Buz ve halı…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Sürtünme durdurur', f: ['nwfh', 'nwvb'], m: ['Buzdaki disk sabit hızla gitti (net kuvvet ≈ 0). Halıdaki diski sürtünme kuvveti yavaşlatıp durdurdu.', 'Otobüs aniden fren yapınca yolcunun öne savrulması da eylemsizliktir: yolcunun gövdesi hareketini sürdürmek ister.'] } },
    { do: arabaK, p: { t: '1 kg ve 2 kg\'lık iki arabaya ayrı ayrı 10 N\'luk kuvvet uygulanıyor (sürtünmesiz). İvmeler kaçar m/s² olur?', o: ['10 ve 10', '10 ve 5', '5 ve 10', '20 ve 10'], d: 1 } },
    { sub: 'İki arabayı aynı kuvvetle çekelim.', go: '▶︎ Çek' },
    { do: S => { S.kos = 1; }, sub: 'Arabalar hızlanıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kütle büyükse ivme küçük', f: ['nwA', 'nwB'], m: [`${FM(`a = ${F('F', 'm')}`)} → 1 kg: <em>10 m/s²</em> · 2 kg: <em>5 m/s²</em>. Aynı sürede hafif araba iki kat yol aldı.`] } },
    { do: S => patenK(S, 40, 80), p: { t: 'Buzda 40 kg ve 80 kg iki patenci birbirini itiyor. Birbirlerine uyguladıkları kuvvetler için ne söylenir?', o: ['Ağır olan daha büyük kuvvet uygular', 'Kuvvetler eşit büyüklükte ve zıt yönlüdür', 'Hafif olan daha büyük kuvvet uygular', 'Yalnız iten kuvvet uygular'], d: 1 } },
    { sub: 'Patenciler birbirini itiyor.', go: '▶︎ İt' },
    { do: S => { S.kos = 1; }, sub: 'Etki–tepki…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Etki–tepki (3. yasa)', f: ['nwV1', 'nwV2'], m: ['Kuvvetler <em>eşit ve zıt</em> (100 N), ama ivmeler farklı: 40 kg için 2,5 m/s², 80 kg için 1,25 m/s².', 'Hafif patenci iki kat hızla uzaklaştı. Roket gazı geriye iter, gaz da roketi ileri iter.'] } },
    { k: { tur: 'dikkat', b: 'Etki–tepki çifti nasıl tanınır?', m: ['Çift kuvvetler <em>farklı cisimlere</em> etki eder: A, B\'yi itiyorsa B de A\'yı iter.', 'Masadaki kitabın ağırlığı ile masanın kitaba tepkisi çift <em>değildir</em> (ikisi de kitaba etki eder). Ağırlığın çifti, kitabın Dünya\'yı çekmesidir.'] } },
    { do: S => kutuK(S, 5, 20, 0, 0.5, 0.3), k: { tur: 'kavram', b: 'Sürtünme', f: ['nwf'], m: [`Statik sürtünme en çok ${FM('f<sub>s,max</sub> = μ<sub>s</sub> · N')}, kinetik ${FM('f<sub>k</sub> = μ<sub>k</sub> · N')}.`, '5 kg kutu, μ<sub>s</sub> = 0,5: 25 N\'a kadar kuvvet kutuyu kıpırdatamaz; 20 N\'luk kuvvete sürtünme 20 N ile karşı koyar.', 'Sürtünme yüzey alanına bağlı değildir; yüzeylerin cinsine ve dik tepki kuvvetine bağlıdır.'] } },
    { x: { b: 'Kendin dene', m: ['Kuvveti ve yüzeyi değiştir, kutuyu it.'],
      kay: [{ ad: 'F', etiket: 'F', min: 0, max: 50, adim: 5, deger: 30, birim: 'N', set: (S, v) => { kutuK(S, 5, v, 0, S._mu ? 0.5 : 0, S._mu ? 0.3 : 0); S.kos = 1; } },
            { ad: 'mu', etiket: 'Sürtünme (0/1)', min: 0, max: 1, adim: 1, deger: 1, birim: '', set: (S, v) => { kutuK(S, 5, S._F == null ? 30 : S._F, 0, v ? 0.5 : 0, v ? 0.3 : 0); S.kos = 1; } }],
      olc: S => { const F0 = S._F, mu = S._mu; if (!mu) return `Sürtünmesiz: a = ${F(String(F0), '5')} = <em>${fs(F0 / 5)} m/s²</em>`;
        return F0 <= 25 ? `F = ${F0} N ≤ 25 N → kutu <em>durur</em>, f<sub>s</sub> = ${F0} N` : `F = ${F0} N > 25 N → kayar: a = ${F(`${F0} − 15`, '5')} = <em>${fs((F0 - 15) / 5)} m/s²</em>`; } } },
    { k: { tur: 'ozet', b: 'Özet', m: ['1. yasa: F<sub>net</sub> = 0 → sabit hız ya da durgun · 2. yasa: ' + FM('F<sub>net</sub> = m a') + ' · 3. yasa: kuvvetler çift, eşit, zıt ve farklı cisimlere etki eder.'] } },
  ] });
  const gNw = gorev(sNw, { yk: 'AYT3-g3', no: 3, icon: '⛸️', name: 'Newton laboratuvarı soruları', task: 'Bileşke kuvvet, eylemsizlik, F = ma, etki–tepki, sürtünme ve bağlı cisimler.', data: [['g', '10 m/s²']], steps: [
    { do: S => kutuK(S, 4, 30, 10, 0, 0), sub: '4 kg kutuya iki yatay kuvvet uygulanıyor.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'Sürtünmesiz yatay zemindeki 4 kg\'lık kutuya sağa 30 N, sola 10 N\'luk kuvvet uygulanıyor. Kutunun ivmesi kaç m/s²\'dir?', o: ['5', '10', '2,5', '7,5'], f: ['nwF1', 'nwF2', 'nwT'],
      s: ['F<sub>net</sub> = 30 − 10 = 20 N (sağa)', `a = ${F('20', '4')} = <em>5 m/s²</em> ✓`], n: ['Düşeyde mg ve N dengededir; hareketi yatay kuvvetlerin bileşkesi belirler.', 'Ağırlık (mg) cismin ağırlık merkezinden düşey aşağı, N zeminden cisme doğru yukarıdır.'] } },
    { do: S => kutuK(S, 10, 40, 0, 0.5, 0.3), q: { t: '10 kg\'lık kutu ile zemin arasında μ<sub>s</sub> = 0,5 ve μ<sub>k</sub> = 0,3. Duran kutuya 40 N yatay kuvvet uygulanırsa sürtünme kuvveti kaç N olur?', o: ['40', '50', '30', '0'], f: ['nwf'],
      s: ['f<sub>s,max</sub> = 0,5 · 100 = 50 N', '40 N < 50 N → kutu kıpırdamaz; statik sürtünme uygulanan kuvvete eşit: <em>40 N</em> ✓'], n: ['Statik sürtünme sabit bir sayı değildir; en çok μ<sub>s</sub>N olabilir.', 'Kutu kaysaydı sürtünme μ<sub>k</sub>N = 30 N olurdu.'] } },
    { do: S => patenK(S, 50, 75), q: { t: 'Sürtünmesiz buzda 50 kg ve 75 kg\'lık iki patenci birbirini itiyor. Hafif patencinin ivmesi ağır olanınkinin kaç katıdır?', o: ['1,5', '1', F('2', '3'), '2,5'], f: ['nwV1', 'nwV2'],
      s: ['Kuvvetler eşit (3. yasa): F aynı', `${F('a<sub>1</sub>', 'a<sub>2</sub>')} = ${F('m<sub>2</sub>', 'm<sub>1</sub>')} = ${F('75', '50')} = <em>1,5</em> ✓`], n: ['Etki–tepki kuvvetleri eşittir; ivmeler kütleyle ters orantılıdır.'] } },
    { do: diskK, q: { t: 'Hareket eden bir cisme etki eden bütün kuvvetlerin bileşkesi sıfır olursa cisim nasıl hareket eder?', o: ['Sabit hızla doğrusal', 'Yavaşlayıp durur', 'Hızlanır', 'Hemen durur'], f: ['nwvb'],
      s: ['1. yasa: F<sub>net</sub> = 0 → ivme 0 → <em>sabit hızla doğrusal</em> ✓'], n: ['Yavaşlayan bir cisim görüyorsan ona hareketine zıt yönde bir kuvvet (sürtünme gibi) etki ediyordur.'] } },
    { do: arabaK, q: { t: 'Sürtünmesiz yatay düzlemde birbirine iple bağlı 3 kg ve 2 kg\'lık arabalardan önde olana 20 N\'luk kuvvet uygulanıyor. İpteki gerilme kuvveti kaç N\'dur? (İp önde 3 kg, arkada 2 kg arabayı bağlıyor.)', o: ['8', '12', '20', '4'],
      s: [`§1. YOL`, `Sistem: a = ${F('20', '3 + 2')} = 4 m/s²`, 'Arka araba (2 kg) yalnız iple çekilir: T = 2 · 4 = <em>8 N</em> ✓', '§2. YOL', 'Ön araba: 20 − T = 3 · 4 → T = <em>8 N</em> ✓'], n: ['İp gerilmesi, ipin çektiği cisimlerin kütlesiyle orantılıdır: T = F · m<sub>arka</sub> / m<sub>toplam</sub>.'] } },
  ] });
  FZ.konuEk('TYT', 'Hareket ve Kuvvet', { dersler: [dNw] });
  FZ.konuEk('AYT', "Newton'un Hareket Yasaları", { gorevler: [gNw] });

  // =====================================================================
  // HAREKET LABORATUVARI: yol–yer değiştirme · karşılaşma · yetişme
  // =====================================================================
  const YOLP = [V3(-3, 0.05, 1.5), V3(1, 0.05, 1.5), V3(1, 0.05, -1.5)];   // 4 m doğu + 3 m kuzey
  const sHr = sahne({ icon: '🚗', cam: [[0.6, 7, 9], [0.6, 0, 0]], plate: [10, 5, 0, 0], data: [['Hızlar', 'sabit']],
    S0: () => ({ mod: 'yol', tk: 0, tt: 0, kos: 0, v1: 2, v2: 1, d: 6 }),
    kur(g) {
      const G = {}; ['yol', 'kars'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      const a1 = FZ.araba(G.yol, 0xef4444); a1.scale.setScalar(0.6);
      const iz = FZ.cizgi(G.yol, 0x111827); FZ.setLine(iz, YOLP);
      const yd = ok(0x7c3aed, 'hrD');
      kutu(G.kars, 10, 0.02, 1.4, 0x374151, 0, 0.01, 0, { edge: false });
      const k1 = FZ.araba(G.kars, 0xef4444), k2 = FZ.araba(G.kars, 0x2563eb); k1.scale.setScalar(0.5); k2.scale.setScalar(0.5);
      const v1 = ok(0xdc2626, 'hrV1'), v2 = ok(0x2563eb, 'hrV2');
      etiket('hrD', 'yer değiştirme', '#7c3aed'); etiket('hrV1', '', '#dc2626'); etiket('hrV2', '', '#2563eb'); kart('hrT', '', '#F5C400'); etiket('hrA', 'A', '#111827'); etiket('hrB', 'B', '#111827'); etiket('hrC', 'C', '#111827');
      return { G, a1, iz, yd, k1, k2, v1, v2 };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k || (S.mod === 'yet' && k === 'kars'));
      o.yd.visible = false; o.v1.visible = false; o.v2.visible = false;
      if (S.mod === 'yol') {
        if (S.kos) { S.tt = Math.min(7, S.tt + dt * 1.4); if (S.tt >= 7) S.kos = 0; }
        const s = S.tt, p = s <= 4 ? YOLP[0].clone().lerp(YOLP[1], s / 4) : YOLP[1].clone().lerp(YOLP[2], (s - 4) / 3);
        o.a1.position.copy(p); o.a1.rotation.y = s <= 4 ? 0 : Math.PI / 2;
        ['hrA', 'hrB', 'hrC'].forEach((id, i) => FZ.show(id, YOLP[i].clone().add(V3(-0.3, 0.6, 0)), 1));
        if (S.tt >= 7) { const d = YOLP[2].clone().sub(YOLP[0]); FZ.setArrow(o.yd, YOLP[0].clone().add(V3(0, 0.1, 0)), d, d.length()); FZ.show('hrD', V3(-1.4, 0.6, -0.3), 1); }
        FZ.setTag('hrT', `Alınan yol = ${fs(s)} m${S.tt >= 7 ? ' · yer değiştirme = 5 m (A → C)' : ''}`); FZ.show('hrT', V3(0.6, 2.2, -2.5), 1);
      } else {
        // kars: arabalar birbirine doğru · yet: aynı yönde, arkadaki daha hızlı
        if (S.kos) S.tk += dt * 0.8;
        const T = S.mod === 'kars' ? S.d / (S.v1 + S.v2) : S.d / (S.v1 - S.v2), t = Math.min(S.tk, T); if (S.tk >= T) S.kos = 0;
        const x0 = -3.2, sc = Math.min(0.9, 5.2 / (S.mod === 'kars' ? S.d : S.d + S.v2 * T)), x1 = x0 + S.v1 * t * sc, x2 = S.mod === 'kars' ? x0 + (S.d - S.v2 * t) * sc : x0 + (S.d + S.v2 * t) * sc;
        o.k1.position.set(x1, 0.02, 0.35); o.k2.position.set(x2, 0.02, -0.35); o.k2.rotation.y = S.mod === 'kars' ? Math.PI : 0;
        FZ.setArrow(o.v1, V3(x1, 1.0, 0.35), V3(1, 0, 0), S.v1 * KV); FZ.setArrow(o.v2, V3(x2, 1.0, -0.35), V3(S.mod === 'kars' ? -1 : 1, 0, 0), S.v2 * KV);
        FZ.setTag('hrV1', `${S.v1} m/s`); FZ.show('hrV1', V3(x1, 0.2, 1.1), 1); FZ.setTag('hrV2', `${S.v2} m/s`); FZ.show('hrV2', V3(x2, 1.3, -0.8), 1);
        FZ.setTag('hrT', `t = ${fs(t)} s${S.tk >= T ? (S.mod === 'kars' ? ' · karşılaştılar!' : ' · yetişti!') : ''}`); FZ.show('hrT', V3(0.6, 2.4, -1), 1);
      }
    },
    qp: () => V3(0.6, 3, -1.5) });
  const yolK = S => Object.assign(S, { mod: 'yol', tt: 0, kos: 0 });
  const karsK = (S, v1, v2, d) => Object.assign(S, { mod: 'kars', v1, v2, d, tk: 0, kos: 0 });
  const yetK = (S, v1, v2, d) => Object.assign(S, { mod: 'yet', v1, v2, d, tk: 0, kos: 0 });
  const dHr = ders(sHr, { yk: 'TYT3-d3', no: 3, icon: '🚗', name: 'Hareket laboratuvarı: yol, yer değiştirme, karşılaşma', task: 'Yol ve yer değiştirme, sürat ve hız, karşılaşma ve yetişme problemleri.', steps: [
    { do: yolK, k: { tur: 'merak', b: 'Arabanın kilometre sayacı neyi ölçer?', m: ['Araba A\'dan B\'ye 4 m doğuya, sonra C\'ye 3 m kuzeye gidecek. Ne kadar yol aldı, ne kadar yer değiştirdi?'], dugme: 'Başlayalım ▶︎' } },
    { sub: 'Arabayı sürelim.', go: '▶︎ Sür' },
    { do: S => { S.kos = 1; }, sub: 'Araba A → B → C…', until: S => S.tt >= 7 },
    { p: { t: 'Arabanın A\'dan C\'ye yer değiştirmesi kaç metredir?', o: ['7', '5', '1', '12'], d: 1 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yol skaler, yer değiştirme vektör', f: ['hrD', 'hrT'], m: ['Alınan yol = 4 + 3 = 7 m. Yer değiştirme ilk konumdan son konuma çizilen ok: ' + SQ('4² + 3²') + ' = <em>5 m</em>.', `${FM(`Ortalama sürat = ${F('alınan yol', 'süre')}`)} · ${FM(`ortalama hız = ${F('yer değiştirme', 'süre')}`)}`] } },
    { do: S => karsK(S, 2, 1, 6), p: { t: 'Aralarında 6 m olan iki araba 2 m/s ve 1 m/s hızlarla birbirine doğru gidiyor. Kaç saniye sonra karşılaşırlar?', o: ['6', '2', '3', '1'], d: 1 } },
    { sub: 'Arabaları harekete geçirelim.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Karşılaşma…', until: S => !S.kos && S.tk > 0 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Karşılaşma', f: ['hrT'], m: [`${FM(`t = ${F('d', 'v<sub>1</sub> + v<sub>2</sub>')}`)} = ${F('6', '2 + 1')} = <em>2 s</em>. Hızlı araba 4 m, yavaş araba 2 m yol aldı.`] } },
    { do: S => yetK(S, 3, 1, 6), p: { t: 'Aynı yönde giden iki arabadan arkadaki 3 m/s, öndeki 1 m/s hızla gidiyor; aralarında 6 m var. Kaç saniye sonra yetişir?', o: ['1,5', '3', '6', '2'], d: 1 } },
    { sub: 'Yetişme…', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Arkadaki araba yaklaşıyor…', until: S => !S.kos && S.tk > 0 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yetişme', f: ['hrT'], m: [`${FM(`t = ${F('d', 'v<sub>1</sub> − v<sub>2</sub>')}`)} = ${F('6', '3 − 1')} = <em>3 s</em>.`, 'Aradaki mesafe her saniye hız farkı kadar kapanır.'] } },
    { x: { b: 'Kendin dene', m: ['Hızları değiştir; karşılaşma süresini ölç.'],
      kay: [{ ad: 'v1', etiket: 'v<sub>1</sub>', min: 1, max: 4, adim: 1, deger: 2, birim: 'm/s', set: (S, v) => { karsK(S, v, S._v2 || 1, 6); S.kos = 1; } },
            { ad: 'v2', etiket: 'v<sub>2</sub>', min: 1, max: 4, adim: 1, deger: 1, birim: 'm/s', set: (S, v) => { karsK(S, S._v1 || 2, v, 6); S.kos = 1; } }],
      olc: S => `t = ${F('6', `${S._v1} + ${S._v2}`)} = <em>${fs(6 / (S._v1 + S._v2))} s</em>` } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Yol skaler, yer değiştirme vektördür (ilk → son konum).', `Karşılaşma ${FM(`t = ${F('d', 'v<sub>1</sub> + v<sub>2</sub>')}`)} · yetişme ${FM(`t = ${F('d', 'v<sub>1</sub> − v<sub>2</sub>')}`)}`] } },
  ] });
  const gHr = gorev(sHr, { yk: 'TYT3-g4', no: 4, icon: '🛣️', name: 'Hareket laboratuvarı soruları', task: 'Yol–yer değiştirme, sürat–hız, karşılaşma ve yetişme.', data: [['Hızlar', 'sabit']], steps: [
    { do: yolK, sub: 'A → B → C yolculuğu (4 m doğu + 3 m kuzey).', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: 'Araba A → B → C yolunu 7 s\'de alıyor. Ortalama sürati ve ortalama hızının büyüklüğü kaç m/s\'dir?', o: [`1 ve ${F('5', '7')}`, `${F('5', '7')} ve 1`, '1 ve 1', `${F('7', '5')} ve 1`], f: ['hrT', 'hrD'],
      s: [`Ortalama sürat = ${F('7 m', '7 s')} = 1 m/s`, `Ortalama hız = ${F('5 m', '7 s')} = <em>${F('5', '7')} m/s</em> ✓`], n: ['Ortalama hızın büyüklüğü ortalama sürati geçemez; yol doğrusal ve tek yönlüyse eşittir.'] } },
    { do: S => karsK(S, 3, 2, 10), q: { t: 'Aralarında 10 m olan iki araba 3 m/s ve 2 m/s sabit hızlarla birbirine doğru hareket ediyor. Karşılaştıklarında hızlı araba kaç m yol almış olur?', o: ['6', '4', '5', '10'], f: ['hrT'],
      s: [`t = ${F('10', '3 + 2')} = 2 s`, 'Hızlı araba: 3 · 2 = <em>6 m</em> ✓'], n: ['Karşılaşmada alınan yollar hızlarla orantılıdır: 3 : 2 → 6 m ve 4 m.'] } },
    { do: S => yetK(S, 4, 1, 6), q: { t: 'Aynı yönde hareket eden arabalardan arkadaki 4 m/s, öndeki 1 m/s hızla gidiyor. Aralarında 6 m varsa arkadaki kaç s sonra yetişir?', o: ['2', '1,2', '6', '1,5'], f: ['hrT'],
      s: [`t = ${F('6', '4 − 1')} = <em>2 s</em> ✓`], n: ['Aynı yönde hareket ederken aradaki uzaklık hız farkı kadar kapanır.'] } },
    { q: { t: 'Bir koşucu 400 m\'lik pistte tam bir tur atıp başladığı yere dönüyor. Yer değiştirmesi kaç m\'dir?', o: ['0', '400', '200', '800'],
      s: ['İlk ve son konum aynı → yer değiştirme <em>0</em> ✓', 'Alınan yol ise 400 m.'], n: ['Tam turda ortalama hız 0, ortalama sürat ise yol / süre olur.'] } },
  ] });
  FZ.konuEk('TYT', 'Hareket ve Kuvvet', { dersler: [dHr], gorevler: [gHr] });
})();
