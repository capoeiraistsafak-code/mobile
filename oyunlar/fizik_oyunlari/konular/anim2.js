// Animasyon programındaki projelerden: 11. sınıf statik–kinetik sürtünme, 12. sınıf Kepler kanunları,
// 9–12. sınıf "1. dönem 1. yazılı" soru videoları (her sınıf 5 soru)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');

  // =====================================================================
  // STATİK VE KİNETİK SÜRTÜNME — itilen dolap (1 birim = 50 N kuvvet)
  // =====================================================================
  const KB = 80;   // kuvvet ölçeği: 80 N → 1 birim ok (aynı ölçek bütün kuvvetlerde)
  const sSur = sahne({ icon: '🗄️', cam: [[2.2, 4.2, 15], [2.2, 1.8, 0]], plate: [13, 4, 2, 0],
    data: [['Dolabın kütlesi', 'm = 10 kg'], ['Statik sürtünme katsayısı', 'k<sub>s</sub> = 0,5'], ['Kinetik sürtünme katsayısı', 'k<sub>k</sub> = 0,3'], ['g', '10 m/s²']],
    S0: () => ({ m: 10, ks: 0.5, kk: 0.3, F: 0, Fh: 0, x: -0.5, v: 0, kos: 0, iz: [] }),
    kur(g) {
      kutu(g, 11, 0.12, 2.4, 0x92400e, 2, 0.06, 0);   // tahta zemin
      const dol = new THREE.Group(); g.add(dol);
      kutu(dol, 1.3, 2, 0.9, 0x8a5a33, 0, 1.12, 0); kutu(dol, 0.6, 1.8, 0.02, 0x6b4423, -0.32, 1.12, 0.46, { edge: false }); kutu(dol, 0.6, 1.8, 0.02, 0x6b4423, 0.32, 1.12, 0.46, { edge: false });
      top(dol, 0.04, 0xf1cf9e, -0.06, 1.12, 0.48, { edge: false }); top(dol, 0.04, 0xf1cf9e, 0.06, 1.12, 0.48, { edge: false });
      const graf = duzCizgi(g, 0x111827), eks = duzCizgi(g, 0x94a3b8), nok = top(g, 0.09, 0xdc2626, 0, 0, 0, { edge: false });
      etiket('srF', 'F', '#2563eb'); etiket('srf', 'f<sub>s</sub>', '#dc2626'); etiket('srN', 'N', '#0891b2'); etiket('srG', 'mg', '#7c3aed'); kart('srt', '', '#F5C400'); kart('srg', 'f – F grafiği', '#475569');
      return { dol, graf, eks, nok, oF: ok(0x3b82f6, 'srF'), of: ok(0xef4444, 'srf'), oN: ok(0x06b6d4, 'srN'), oG: ok(0x8b5cf6, 'srG') };
    },
    tick(S, dt, o) {
      const N = S.m * 10, fsMax = S.ks * N, fk = S.kk * N;
      if (S.kos) { S.F += Math.sign(S.Fh - S.F) * Math.min(Math.abs(S.Fh - S.F), dt * 12); }
      let f, a = 0;
      if (S.v <= 1e-6 && S.F <= fsMax + 1e-9) { f = S.F; S.v = 0; }                        // durgun: statik sürtünme = uygulanan kuvvet
      else { f = fk; a = (S.F - fk) / S.m; S.v = Math.max(0, S.v + a * dt); if (S.v === 0 && S.F <= fsMax) a = 0; }   // kayıyor: kinetik sürtünme sabit
      S.x += S.v * dt * 0.25; if (S.x > 2.6) { S.x = 2.6; S.v = 0; S.kos = 0; }
      S.f = f; S.a = a; o.dol.position.x = S.x;
      const c = V3(S.x - 0.25, 1.12, 0.6), alt = V3(S.x + 0.25, 0.12, 0.6);
      FZ.setArrow(o.oG, c, V3(0, -1, 0), N / KB); FZ.show('srG', c.clone().add(V3(-0.4, -N / KB + 0.15, 0)), 1);                // ağırlık: merkezden aşağı
      FZ.setArrow(o.oN, alt, V3(0, 1, 0), N / KB); FZ.show('srN', alt.clone().add(V3(0.35, N / KB - 0.1, 0)), 1);   // tepki: zeminden dolaba, yukarı
      if (S.F > 0.5) { FZ.setArrow(o.oF, V3(S.x - 0.65 - S.F / KB, 1.12, 0.3), V3(1, 0, 0), S.F / KB); FZ.show('srF', V3(S.x - 0.75 - S.F / KB, 1.45, 0.3), 1); }   // itme: sol yüzden sağa
      if (f > 0.5) { FZ.setArrow(o.of, alt.clone().add(V3(-0.1, 0.05, 0)), V3(-1, 0, 0), f / KB); FZ.show('srf', alt.clone().add(V3(-0.3 - f / KB, 0.3, 0)), 1); }         // sürtünme: temas yüzeyinde, harekete (eğilime) zıt
      // f–F grafiği (sağ üst)
      const gx = F => 2.1 + F / 100 * 2.4, gy = ff => 2.5 + ff / 100 * 2.4, pts = [];
      for (let F = 0; F <= 100; F += 1) pts.push(V3(gx(F), gy(F <= fsMax ? F : fk), -0.8));
      setLine(o.graf, pts); setLine(o.eks, [V3(gx(0), gy(70), -0.8), V3(gx(0), gy(0), -0.8), V3(gx(100), gy(0), -0.8)]);
      o.nok.position.set(gx(Math.min(100, S.F)), gy(f), -0.75); FZ.show('srg', V3(gx(50), gy(75), -0.8), 1);
      FZ.setTag('srt', `F = ${Math.round(S.F)} N · f<sub>s</sub> = ${Math.round(f)} N · ${S.v > 0 ? `kayıyor, a = ${fs(a)} m/s²` : 'durgun'}`); FZ.show('srt', V3(3.3, 5.0, -0.8), 1);
    },
    qp: (at, S) => V3(S.x, 3, 0) });
  function duzCizgi(g, renk) { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; }
  function setLine(l, p) { FZ.setLine(l, p); }
  const it = (S, Fh, m, ks, kk) => { S.Fh = Fh; S.kos = 1; if (m) { S.m = m; S.ks = ks; S.kk = kk; } };
  const sifir = S => { S.F = 0; S.Fh = 0; S.v = 0; S.x = -0.5; S.kos = 0; };
  const dSur = ders(sSur, { yk: 'AYT3-d2', no: 2, icon: '🗄️', name: 'Dolabı itmeye başlamak neden zor?', task: 'Statik ve kinetik sürtünme, en büyük statik sürtünme, f = k·N, sürtünmeli yüzeyde ivme. (11. sınıf · 1. ders)', steps: [
    { k: { tur: 'merak', b: 'Ağır bir dolabı itmeye BAŞLAMAK, onu kaydırmaktan neden daha zordur?', m: ['Dolap kımıldayana kadar zorlanırız; kaymaya başlayınca daha az kuvvet yeter.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Statik sürtünme', f: ['srf', 'srF'], m: ['Cisim <em>durgunken</em> etki eden sürtünmeye statik sürtünme denir.', 'Uygulanan kuvvet arttıkça statik sürtünme de <em>artar</em>; cisim kımıldamaz.'] } },
    { p: { t: '10 kg\'lık dolaba 30 N kuvvet uygulanıyor ve dolap kımıldamıyor. Sürtünme kuvveti kaç N\'dur?', o: ['0', '30 N', '50 N', '100 N'], d: 1 } },
    { sub: 'Dolabı 30 N ile itelim.', go: '▶︎ İt' },
    { do: S => it(S, 30), sub: 'Kuvvet artıyor, dolap durgun…', wait: 3.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Statik sürtünme kuvvete eşit', f: ['srf', 'srF', 'srt'], m: ['Dolap durgun → net kuvvet sıfır → f<sub>s</sub> = F = 30 N (oklar eşit boyda).', 'Statik sürtünme "hazır bir sayı" değildir: uygulanan kuvvet kadar büyür.'] } },
    { k: { tur: 'kavram', b: 'En büyük statik sürtünme', m: [`${FM('f<sub>s,max</sub> = k<sub>s</sub> · N')} = 0,5 · 100 = 50 N`, 'Kuvvet bu değeri aşınca dolap kaymaya başlar.'] } },
    { sub: 'Kuvveti 60 N\'a çıkaralım.', go: '▶︎ Daha çok it' },
    { do: S => it(S, 60), sub: '50 N\'u geçince dolap kaymaya başlar…', wait: 5 },
    { k: { tur: 'kavram', b: 'Kinetik sürtünme', f: ['srt', 'srf'], m: [`Kayan cisme ${FM('f<sub>k</sub> = k<sub>k</sub> · N')} = 0,3 · 100 = 30 N etki eder ve <em>sabittir</em>.`, `f<sub>k</sub> < f<sub>s,max</sub>: başlatmak kaydırmaktan zordur. Grafikteki düşüş bunu gösterir.`, `${FM(`a = ${F('F − f<sub>k</sub>', 'm')}`)} = ${F('60 − 30', '10')} = 3 m/s²`] } },
    { x: { b: 'Uygulanan kuvveti değiştir', m: ['Dolabı baştan durgun koyup farklı kuvvetler deneyin.'],
      kay: [{ ad: 'Fh', etiket: 'F', min: 0, max: 90, adim: 10, deger: 40, birim: 'N', set: (S, v) => { sifir(S); it(S, v); } }],
      olc: S => S._Fh <= 50 ? `F = ${S._Fh} N ≤ 50 N → <em>durgun</em>, f<sub>s</sub> = <em>${S._Fh} N</em>` : `F = ${S._Fh} N > 50 N → <em>kayar</em>, f<sub>k</sub> = 30 N, a = <em>${fs((S._Fh - 30) / 10)} m/s²</em>` } },
    { do: S => sifir(S), k: { tur: 'dikkat', b: 'Sık yapılan yanlışlar', m: ['"Durgun cisme her zaman k<sub>s</sub>·N kadar sürtünme etki eder" yanlış: f<sub>s</sub> = F (en fazla k<sub>s</sub>N).', 'Sürtünme kuvveti temas yüzeyinde ve harekete (ya da hareket eğilimine) <em>zıt</em> yöndedir. N her zaman yüzeye diktir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`Durgun: f<sub>s</sub> = F ≤ ${FM('k<sub>s</sub> N')} · kayarken: ${FM('f<sub>k</sub> = k<sub>k</sub> N')} (sabit) · k<sub>k</sub> < k<sub>s</sub>`] } },
  ] });
  const gSur = gorev(sSur, { yk: 'AYT3-g2', no: 2, icon: '🗄️', name: 'Dolabı kaydır', task: 'Statik ve kinetik sürtünme ile ivme hesapları (11. sınıf yazılı soruları dahil).', steps: [
    { do: S => sifir(S), sub: '10 kg\'lık dolap tahta zeminde duruyor.', go: '▶︎ Başlat' },
    { do: S => it(S, 20), q: { t: 'Durgun dolaba 20 N yatay kuvvet uygulanıyor, dolap kımıldamıyor. Sürtünme kuvveti kaç N\'dur?', o: ['20 N', '50 N', '30 N', '0'], f: ['srf', 'srF'],
      s: ['Dolap durgun → ΣF = 0', 'f<sub>s</sub> = F = <em>20 N</em> ✓'], n: ['50 N, statik sürtünmenin alabileceği <em>en büyük</em> değerdir; şu an o kadar değildir.'] } },
    { q: { t: 'Dolap en az kaç N\'luk kuvvetle kaymaya başlar? (k<sub>s</sub> = 0,5)', o: ['50 N', '30 N', '100 N', '20 N'],
      s: ['N = mg = 100 N', `f<sub>s,max</sub> = k<sub>s</sub> · N = 0,5 · 100 = <em>50 N</em> ✓`], n: ['Bu değeri aşan kuvvet dolabı harekete geçirir.'] } },
    { do: S => it(S, 60), q: { t: 'Dolap 60 N\'luk kuvvetle kayarken ivmesi kaç m/s²\'dir? (k<sub>k</sub> = 0,3)', o: ['3 m/s²', '6 m/s²', '1 m/s²', '0'], f: ['srt'],
      s: ['f<sub>k</sub> = 0,3 · 100 = 30 N', `a = ${F('F − f<sub>k</sub>', 'm')} = ${F('60 − 30', '10')} = <em>3 m/s²</em> ✓`], n: ['Kayan cisme kinetik sürtünme etki eder; statik değer artık kullanılmaz.'] } },
    { do: S => { sifir(S); S.m = 4; S.ks = 0.4; S.kk = 0.25; it(S, 30); }, q: { t: '4 kg\'lık kutuya 30 N yatay kuvvet uygulanıyor, kutuya 10 N sürtünme kuvveti etki ediyor. Kutunun ivmesi kaç m/s²\'dir? (g = 10 m/s²)', o: ['5 m/s²', '7,5 m/s²', '10 m/s²', '2,5 m/s²'], f: ['srF', 'srf'],
      s: ['Düşeyde: mg = 40 N aşağı, N = 40 N yukarı → dengede.', `Yatayda net kuvvet 30 − 10 = 20 N → ${FM(`a = ${F('F<sub>net</sub>', 'm')}`)} = ${F('20', '4')} = <em>5 m/s²</em> ✓`], n: ['Önce serbest cisim diyagramı: ağırlık ve tepki düşeyde birbirini dengeler.'] } },
  ] });
  FZ.konuEk('AYT', "Newton'un Hareket Yasaları", { dersler: [dSur], gorevler: [gSur] });

  // =====================================================================
  // KEPLER KANUNLARI (12. sınıf · 1. ders) — mevcut yörünge sahnesi
  // =====================================================================
  const sKep = FZ.taban('AYT', 'Kütle Çekim ve Kepler Yasaları');
  const dKep = ders(sKep, { yk: 'AYT18-d2', no: 2, icon: '❄️', name: 'Dünya ocakta Güneş\'e daha yakın!', task: 'Kepler\'in 1. ve 2. kanunu; günberi, günöte ve mevsimler. (12. sınıf · 1. ders)', steps: [
    { k: { tur: 'merak', b: 'Dünya Güneş\'e OCAKTA daha yakın, temmuzda daha uzak!', m: ['Ama ocakta kış yaşıyoruz… Yakınlık mevsimleri belirlemiyorsa ne belirliyor? Önce yörüngeye bakalım.'], dugme: 'Başlayalım ▶︎' } },
    { do: S => { S.alan = 0; S.aAU = 3; }, k: { tur: 'kavram', b: 'Kepler\'in 1. kanunu', m: ['Gezegenler Güneş\'in çevresinde <em>elips</em> yörüngelerde dolanır; Güneş elipsin <em>odaklarından birindedir</em> (merkezde değil).', 'En yakın nokta: <em>günberi</em> · en uzak nokta: <em>günöte</em>.'] } },
    { p: { t: 'Dünya yörüngesinde en hızlı hangi ayda hareket eder?', o: ['Temmuzda (günöte)', 'Ocakta (günberi)', 'Her ay aynı hızla', 'Nisanda'], d: 1 } },
    { sub: 'Yörüngeyi izleyelim (şekil abartıldı; gerçek yörünge neredeyse çember).', wait: 7 },
    { do: S => { S.alan = 1; }, k: { tur: 'gozlem', sonuc: true, b: 'Kepler\'in 2. kanunu', f: ['k18v'], m: ['Gezegeni Güneş\'e birleştiren doğru, eşit zaman aralıklarında <em>eşit alanlar</em> tarar (sarı dilim).', 'Yakındayken yarıçap kısa → aynı alanı taramak için daha uzun yay → <em>günberide en hızlı</em>: ocakta.'] } },
    { k: { tur: 'dikkat', b: 'Mevsimler uzaklıktan değil', m: ['Dünya\'nın Güneş\'e uzaklığı yıl boyunca yalnız %3 kadar değişir.', 'Mevsimleri <em>dönme ekseninin 23,5° eğikliği</em> belirler: ocakta kuzey yarımküre ışınları eğik alır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['1. kanun: elips yörünge, Güneş odakta.', '2. kanun: eşit sürede eşit alan → günberide hızlı, günötede yavaş.', 'Sıradaki: 3. kanun (T² ∝ a³).'] } },
  ] });
  const gKep = gorev(sKep, { yk: 'AYT18-g2', no: 2, icon: '🪐', name: 'Kepler kanunları', task: 'Elips yörünge, eşit alanlar, günberi–günöte ve periyot.', steps: [
    { do: S => { S.alan = 1; S.aAU = 3; }, sub: 'Gezegen eliptik yörüngede dolanıyor.', go: '▶︎ Başlat' },
    { q: { t: 'Kepler\'in 1. kanununa göre Güneş, gezegen yörüngesinin neresindedir?', o: ['Elipsin odaklarından birinde', 'Elipsin tam merkezinde', 'Yörüngenin üzerinde', 'Odakların tam ortasında'], f: ['k18s'],
      s: ['Yörünge elipstir; Güneş <em>bir odaktadır</em> ✓'], n: ['Elipsin merkezi ile odağı farklı noktalardır.'] } },
    { q: { t: 'Gezegen günberiden günöteye giderken çizgisel hızı nasıl değişir?', o: ['Azalır', 'Artar', 'Değişmez', 'Önce artar sonra azalır'], f: ['k18v'],
      s: ['Eşit sürede eşit alan: uzaklık arttıkça hız <em>azalır</em> ✓'], n: ['Açısal momentum korunumu: m · v · r sabit.'] } },
    { q: { t: 'Eşit sürelerde taranan alanlar için hangisi doğrudur?', o: ['Yörüngenin her yerinde eşittir', 'Günberide daha büyüktür', 'Günötede daha büyüktür', 'Hızla doğru orantılıdır'], f: ['k18v'],
      s: ['Kepler\'in 2. kanunu: <em>eşit sürede eşit alan</em> ✓'], n: ['Alanlar eşit; hızlar farklıdır.'] } },
    { do: S => { S.aAU = 4; }, q: { t: 'Güneş\'e ortalama uzaklığı 9 AB olan bir cismin periyodu kaç yıldır?', o: ['27 yıl', '9 yıl', '81 yıl', '3 yıl'], f: ['k18t'],
      s: [`${FM('T<sup>2</sup> = a<sup>3</sup>')} (yıl, AB) → T<sup>2</sup> = 9<sup>3</sup> = 729`, '<em>T = 27 yıl</em> ✓'], n: ['Dünya için a = 1 AB, T = 1 yıl.'] } },
  ] });
  FZ.konuEk('AYT', 'Kütle Çekim ve Kepler Yasaları', { dersler: [dKep], gorevler: [gKep] });

  // =====================================================================
  // 9. SINIF YAZILI SORULARI
  // =====================================================================
  const s9a = FZ.taban('TYT', 'Fizik Bilimine Giriş');
  const g9a = gorev(s9a, { yk: 'TYT1-g2', no: 2, icon: '📝', name: '9. sınıf yazılı soruları · 1', task: 'Fiziğin alt dalları, temel ve türetilmiş büyüklükler. (1. dönem 1. yazılı)', steps: [
    { do: S => { S.ayir = 0.01; }, sub: 'Yazılıda çıkabilecek sorular.', go: '▶︎ Başlat' },
    { q: { t: 'Gökkuşağının oluşumunu fiziğin hangi alt dalı inceler?', o: ['Optik', 'Mekanik', 'Termodinamik', 'Manyetizma'],
      s: ['Gökkuşağı ışığın kırılmasıyla oluşur → <em>optik</em> ✓'], n: ['Mıknatısın çiviyi çekmesi: manyetizma · buzun erimesi: termodinamik · arabanın hızlanması: mekanik.'] } },
    { q: { t: 'Buzun erimesi fiziğin hangi alt dalının konusudur?', o: ['Termodinamik', 'Optik', 'Mekanik', 'Elektrik'],
      s: ['Isı ve sıcaklıkla ilgili olaylar <em>termodinamiğin</em> konusudur ✓'], n: ['Hal değişimi ısı alışverişiyle olur.'] } },
    { do: S => { S.isik = 4; }, q: { t: 'Aşağıdakilerden hangisi <b>temel</b> büyüklük değildir?', o: ['Hız', 'Kütle', 'Zaman', 'Elektrik akımı'],
      s: ['Hız = yol / zaman → temel büyüklüklerden türetilir ✓', 'Kütle (kg), zaman (s), akım (A) temeldir.'], n: ['Temel büyüklükler başka büyüklüklerden türetilemez.'] } },
    { do: S => { S.isik = 5; S.vek = 1; }, q: { t: 'Kuvvet için hangisi doğrudur?', o: ['Türetilmiş ve vektörel; birimi newton', 'Temel ve skaler; birimi kilogram', 'Türetilmiş ve skaler; birimi joule', 'Temel ve vektörel; birimi newton'],
      s: ['F = m · a → türetilmiş; yönü vardır → vektörel; birimi <em>newton</em> ✓'], n: ['1 N = 1 kg · m/s²'] } },
  ] });
  FZ.konuEk('TYT', 'Fizik Bilimine Giriş', { gorevler: [g9a] });

  const sHK = FZ.taban('TYT', 'Hareket ve Kuvvet');
  const g9b = gorev(sHK, { yk: 'TYT3-g2', no: 2, icon: '📝', name: '9. sınıf yazılı soruları · 2', task: 'Yol–yer değiştirme, sürat–hız, bileşke kuvvet. (1. dönem 1. yazılı)', data: [['Pist', '400 m'], ['Tur süresi', '80 s']], steps: [
    { do: S => { S.x = 0; S.v = 0; }, sub: 'Koşucu 400 m\'lik pistte bir tur atıp başladığı yere dönüyor (80 s).', go: '▶︎ Başlat' },
    { q: { t: 'Koşucunun yer değiştirmesi kaç m\'dir?', o: ['0', '400 m', '200 m', '80 m'],
      s: ['Başladığı yere döndü → başlangıçtan bitişe çizilen ok sıfır', 'Yer değiştirme = <em>0</em> ✓ (alınan yol 400 m)'], n: ['Yol skaler, yer değiştirme vektöreldir.'] } },
    { q: { t: 'Koşucunun ortalama sürati kaç m/s\'dir?', o: ['5 m/s', '0', '10 m/s', '2,5 m/s'],
      s: [`ortalama sürat = ${F('alınan yol', 'süre')} = ${F('400', '80')} = <em>5 m/s</em> ✓`], n: ['Ortalama hız ise yer değiştirme / süre = 0\'dır.'] } },
    { q: { t: 'Bir kutuya 20 N sağa, 50 N sola kuvvet uygulanıyor. Bileşke kuvvet nedir?', o: ['30 N, sola', '70 N, sola', '30 N, sağa', '70 N, sağa'],
      s: ['Zıt yönlü kuvvetler: büyükten küçük çıkarılır → 50 − 20 = 30 N', 'Yön büyük kuvvetin yönü: <em>30 N, sola</em> ✓'], n: ['Aynı yönde olsalardı toplanırdı: 70 N.'] } },
    { q: { t: 'Bir diske birbirine dik 6 N ve 8 N\'luk iki kuvvet uygulanıyor. Bileşke kuvvet kaç N\'dur?', o: ['10 N', '14 N', '2 N', '48 N'],
      s: ['Dik kuvvetler → uç uca ekle, dik üçgen kur', `R = ${SQ('6² + 8²')} = ${SQ('100')} = <em>10 N</em> ✓`], n: ['6-8-10 dik üçgeni sık kullanılır.'] } },
  ] });
  // 10. sınıf
  const g10 = gorev(sHK, { yk: 'TYT3-g3', no: 3, icon: '📝', name: '10. sınıf yazılı soruları', task: 'Sabit hızlı hareket, konum–zaman ve hız–zaman grafikleri, karşılaşma, ivme. (1. dönem 1. yazılı)', steps: [
    { do: S => { S.x = 0; S.v = 20; S.F = 0; S.f = 0; S.sure = 0; S.xMax = 64; }, sub: 'Araç 20 m/s sabit hızla gidiyor.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, q: { t: '20 m/s sabit hızla giden araç 1,2 km uzunluğundaki tüneli kaç saniyede geçer? (aracın boyu önemsiz)', o: ['60 s', '24 s', '6 s', '600 s'], f: ['f3t'],
      s: ['1,2 km = 1200 m', `t = ${F('x', 'v')} = ${F('1200', '20')} = <em>60 s</em> ✓`], n: ['Birim dönüşümünü unutmayın.'] } },
    { q: { t: 'Bir aracın konumu 0–4 s arasında 0\'dan 40 m\'ye düzgün artıyor. Bu aralıkta hızı kaç m/s\'dir?', o: ['10 m/s', '40 m/s', '160 m/s', '4 m/s'],
      s: ['Konum–zaman grafiğinde <em>eğim</em> hızı verir', `v = ${F('Δx', 'Δt')} = ${F('40', '4')} = <em>10 m/s</em> ✓`], n: ['Konum değişmiyorsa (yatay çizgi) araç durmaktadır.'] } },
    { q: { t: 'Aralarında 300 m olan K ve L araçları birbirine doğru 10 m/s ve 20 m/s hızlarla gidiyor. Kaç saniye sonra karşılaşırlar ve karşılaşma noktası K\'den kaç m uzaktadır?', o: ['10 s · 100 m', '10 s · 200 m', '30 s · 100 m', '15 s · 150 m'],
      s: ['Birbirine yaklaşma hızı 10 + 20 = 30 m/s', `t = ${F('300', '30')} = 10 s · K\'nin yolu 10 · 10 = <em>100 m</em> ✓`], n: ['Zıt yönde giden araçlar için hızlar toplanır.'] } },
    { do: S => { S.x = 0; S.v = 0; S.F = 5000; S.f = 0; S.m = 1000; S.sure = 0; S.xMax = 40; S.kos = 1; }, q: { t: 'Duran araç 4 saniyede 20 m/s hıza ulaşıyor (sabit ivmeyle). İvmesi ve bu sürede aldığı yol nedir?', o: ['5 m/s² · 40 m', '5 m/s² · 80 m', '4 m/s² · 40 m', '20 m/s² · 80 m'], f: ['f3t'],
      s: [`a = ${F('Δv', 'Δt')} = ${F('20', '4')} = 5 m/s²`, `x = ${F('1', '2')} a t<sup>2</sup> = ${F('1', '2')} · 5 · 16 = <em>40 m</em> ✓`], n: ['Duruştan başlayan araçta x = ½ a t².'] } },
    { q: { t: 'Hız–zaman grafiğinde: 0–2 s hız 0\'dan 10 m/s\'ye, 2–6 s 10 m/s sabit, 6–8 s 10\'dan 0\'a iniyor. Toplam yer değiştirme kaç m\'dir?', o: ['60 m', '80 m', '40 m', '50 m'],
      s: ['Hız–zaman grafiğinde <em>alan</em> yer değiştirmeyi verir', '½ · 2 · 10 + 4 · 10 + ½ · 2 · 10 = 10 + 40 + 10 = <em>60 m</em> ✓'], n: ['Eğim ivmeyi, alan yer değiştirmeyi verir.'] } },
  ] });
  FZ.konuEk('TYT', 'Hareket ve Kuvvet', { gorevler: [g9b, g10] });

  // =====================================================================
  // 11. SINIF YAZILI SORULARI — mevcut atış sahnesi
  // =====================================================================
  const sAt = FZ.taban('AYT', 'İki Boyutta Hareket (Atışlar)');
  const yeni = S => { S.tt = 0; S.kos = 0; S.iz = []; };
  const g11 = gorev(sAt, { yk: 'AYT5-g2', no: 2, icon: '📝', name: '11. sınıf yazılı soruları', task: 'Serbest düşme, düşey atış ve yatay atış. (1. dönem 1. yazılı)', data: [['g', '10 m/s²'], ['Hava direnci', 'yok']], steps: [
    { do: S => { yeni(S); S.mod = 'yatay'; S.v0 = 0; S.h0 = 80; }, sub: 'Cisim 80 m yükseklikten serbest bırakılacak.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, q: { t: '80 m yükseklikten serbest bırakılan cisim kaç saniyede yere düşer?', o: ['4 s', '8 s', '16 s', '2 s'], f: ['a5t'],
      s: [`${FM(`h = ${F('1', '2')} g t<sup>2</sup>`)} → 80 = 5 t<sup>2</sup> → t<sup>2</sup> = 16`, '<em>t = 4 s</em> ✓'], n: ['Serbest düşmede ilk hız sıfırdır.'] } },
    { q: { t: 'Cisim yere kaç m/s hızla çarpar?', o: ['40 m/s', '80 m/s', '20 m/s', '400 m/s'], f: ['a5y'],
      s: [`v = g · t = 10 · 4 = <em>40 m/s</em> ✓`], n: ['Cisim her saniye bir öncekinden daha çok yol alır (1., 2., 3., 4. saniyelerde 5, 15, 25, 35 m).'] } },
    { do: S => { yeni(S); S.mod = 'egik'; S.h0 = 0; S.v0 = 30; S.th = 90; S.kos = 1; }, q: { t: 'Yerden 30 m/s hızla düşey yukarı atılan top en çok kaç m yükselir ve havada kaç saniye kalır?', o: ['45 m · 6 s', '45 m · 3 s', '90 m · 6 s', '30 m · 3 s'], f: ['a5y'],
      s: ['§1. YOL · süre', `t<sub>çıkış</sub> = ${F('v<sub>0</sub>', 'g')} = 3 s → uçuş 6 s · h = ${F('0 + 30', '2')} · 3 = 45 m`, '§2. YOL · formül', `${FM(`h<sub>max</sub> = ${F('v<sub>0</sub><sup>2</sup>', '2g')}`)} = ${F('900', '20')} = <em>45 m</em> ✓`], n: ['Tepe noktasında hız sıfırdır, ivme yine g (aşağı).'] } },
    { do: S => { yeni(S); S.mod = 'yatay'; S.v0 = 40; S.h0 = 45; S.kos = 1; }, q: { t: '45 m yükseklikten 40 m/s hızla yatay atılan gülle kaç m uzağa düşer?', o: ['120 m', '180 m', '40 m', '90 m'], f: ['a5x', 'a5t'],
      s: ['Düşey: 45 = 5 t<sup>2</sup> → t = 3 s', 'Yatay hız sabit: x = 40 · 3 = <em>120 m</em> ✓'], n: ['Yatay ve düşey hareket birbirinden bağımsızdır.'] } },
    { q: { t: 'Gülle yere kaç m/s hızla çarpar?', o: ['50 m/s', '70 m/s', '40 m/s', '30 m/s'], f: ['a5x', 'a5y'],
      s: ['v<sub>x</sub> = 40 m/s · v<sub>y</sub> = g t = 30 m/s', `v = ${SQ('40² + 30²')} = <em>50 m/s</em> ✓`], n: ['Çarpma hızının bileşenleri birbirine diktir.'] } },
  ] });
  FZ.konuEk('AYT', 'İki Boyutta Hareket (Atışlar)', { gorevler: [g11] });

  // =====================================================================
  // 12. SINIF YAZILI SORULARI — ip ucunda dönen cisim (yeni sahne) + dönen platform
  // =====================================================================
  const sCem = sahne({ icon: '🪀', cam: [[1.8, 9, 9.5], [1.8, 0.8, 0]], plate: [11, 9, 0, 0],
    data: [['π', '3 alınız'], ['Yarıçap', 'r = 2 m'], ['Tur', '10 s\'de 5 tur']],
    S0: () => ({ r: 2, T: 2, ac: 0, kos: 1, kop: 0, kp: null, kv: null }),
    kur(g) {
      silindir(g, 0.08, 0.1, 1.2, 0x475569, 0, 0.6, 0); top(g, 0.12, 0x334155, 0, 1.2, 0);
      const ip = FZ.cizgi(g, 0x111827); ip.material.dashSize = 100; ip.material.gapSize = 0;
      const cis = top(g, 0.22, 0xef4444, 2, 1.2, 0), cember = FZ.cizgi(g, 0x94a3b8);
      etiket('c5v', 'v', '#16a34a'); etiket('c5a', 'a<sub>m</sub>', '#7c3aed'); kart('c5t', '', '#F5C400');
      return { ip, cis, cember, ov: ok(0x22c55e, 'c5v'), oa: ok(0x8b5cf6, 'c5a') };
    },
    tick(S, dt, o) {
      const R = S.r * 0.9, w = 2 * Math.PI / S.T, vb = w * S.r;   // görüntü: 1 m = 0,9 birim
      const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; pts.push(V3(R * Math.cos(a), 1.2, R * Math.sin(a))); } FZ.setLine(o.cember, pts);
      if (S.kop && !S.kp) { S.kp = V3(R * Math.cos(S.ac), 1.2, -R * Math.sin(S.ac)); S.kv = V3(-Math.sin(S.ac), 0, -Math.cos(S.ac)); }
      if (!S.kop) { if (S.kos) S.ac += w * dt * 0.5;   // yavaş çekim (½×)
        const p = V3(R * Math.cos(S.ac), 1.2, -R * Math.sin(S.ac)), tg = V3(-Math.sin(S.ac), 0, -Math.cos(S.ac));
        o.cis.position.copy(p); FZ.setLine(o.ip, [V3(0, 1.2, 0), p]); S.kp = p.clone(); S.kv = tg.clone();
        FZ.setArrow(o.ov, p, tg, vb * 0.22); FZ.show('c5v', p.clone().add(tg.clone().multiplyScalar(vb * 0.22 + 0.3)), 1);
        const ic = V3(-p.x, 0, -p.z).normalize(); FZ.setArrow(o.oa, p, ic, vb * vb / S.r * 0.06); FZ.show('c5a', p.clone().add(ic.clone().multiplyScalar(vb * vb / S.r * 0.06 + 0.35)), 1); }
      else { S.kp.add(S.kv.clone().multiplyScalar(vb * 0.9 * dt * 0.5)); o.cis.position.copy(S.kp); o.ip.visible = false;
        FZ.setArrow(o.ov, S.kp, S.kv, vb * 0.22); FZ.show('c5v', S.kp.clone().add(S.kv.clone().multiplyScalar(vb * 0.22 + 0.3)), 1); if (S.kp.length() > 5) S.kop = 0, S.ac = 0; }
      FZ.setTag('c5t', S.kop ? 'İp koptu: merkezcil kuvvet yok → teğet doğrultuda düzgün doğrusal hareket' : `r = ${fs(S.r)} m · T = ${fs(S.T)} s · v = ${fs(2 * 3 * S.r / S.T)} m/s (π = 3) · görüntü ½×`); FZ.show('c5t', V3(2.4, 1.2, -2.6), 1);
    },
    qp: (at, S, o) => o.cis.position.clone().add(V3(0, 1, 0)) });
  const g12 = gorev(sCem, { yk: 'AYT16-g5', no: 5, icon: '📝', name: '12. sınıf yazılı soruları', task: 'Periyot, frekans, çizgisel ve açısal hız, merkezcil ivme ve kuvvet, ip kopması, viraj. (1. dönem 1. yazılı)', steps: [
    { do: S => { S.r = 2; S.T = 2; S.kop = 0; }, sub: 'Cisim r = 2 m yarıçaplı çemberde düzgün dönüyor.', go: '▶︎ Başlat' },
    { q: { t: 'İpe bağlı cisim 10 saniyede 5 tur atıyor. Periyodu ve frekansı nedir?', o: ['T = 2 s · f = 0,5 Hz', 'T = 0,5 s · f = 2 Hz', 'T = 5 s · f = 0,2 Hz', 'T = 2 s · f = 2 Hz'],
      s: [`T = ${F('10', '5')} = 2 s · ${FM(`f = ${F('1', 'T')}`)} = <em>0,5 Hz</em> ✓`], n: ['Periyot bir turun süresidir; frekans birim zamandaki tur sayısıdır.'] } },
    { q: { t: 'r = 2 m olduğuna göre cismin çizgisel hızı ve açısal hızı nedir? (π = 3)', o: ['6 m/s · 3 rad/s', '3 m/s · 6 rad/s', '12 m/s · 3 rad/s', '6 m/s · 6 rad/s'], f: ['c5v', 'c5t'],
      s: ['§1. YOL', `${FM(`v = ${F('2πr', 'T')}`)} = ${F('2 · 3 · 2', '2')} = 6 m/s · ${FM(`ω = ${F('2π', 'T')}`)} = 3 rad/s ✓`, '§2. YOL', `ω = 3 rad/s → ${FM('v = ω r')} = 3 · 2 = <em>6 m/s</em> ✓`], n: ['Hız her an çembere teğettir.'] } },
    { do: S => { S.r = 3; S.T = 3; }, q: { t: '2 kg\'lık cisim r = 3 m yarıçaplı çemberde 6 m/s hızla dönüyor. Merkezcil ivme ve ipteki gerilme kuvveti nedir?', o: ['12 m/s² · 24 N', '2 m/s² · 4 N', '12 m/s² · 12 N', '18 m/s² · 36 N'], f: ['c5a'],
      s: [`${FM(`a<sub>m</sub> = ${F('v<sup>2</sup>', 'r')}`)} = ${F('36', '3')} = 12 m/s²`, `${FM('F<sub>m</sub> = m · a<sub>m</sub>')} = 2 · 12 = <em>24 N</em> (ipteki gerilme sağlar) ✓`], n: ['Merkezcil ivme her an merkeze doğrudur.'] } },
    { do: S => { S.kop = 1; }, q: { t: 'İp koparsa cisim nasıl hareket eder? (yatay düzlem, sürtünme yok)', o: ['Kopma anındaki hız yönünde (teğet) düzgün doğrusal', 'Merkezden dışarı doğru (yarıçap boyunca)', 'Çember üzerinde dönmeye devam eder', 'Merkeze doğru'], f: ['c5v'],
      s: ['İp koptu → merkezcil kuvvet ortadan kalktı.', 'Net kuvvet sıfır: cisim <em>teğet doğrultuda düzgün doğrusal</em> hareket yapar ✓'], n: ['Sık yanlış: "merkezkaç kuvvetiyle dışarı fırlar". Böyle bir gerçek kuvvet yoktur.'] } },
    { do: S => { S.kop = 0; S.r = 2; S.T = 2; }, q: { t: 'Yatay virajda (r = 50 m) lastik ile yol arasındaki sürtünme katsayısı 0,8. Araç en fazla kaç m/s hızla savrulmadan dönebilir? (g = 10 m/s²)', o: ['20 m/s', '40 m/s', '10 m/s', '400 m/s'],
      s: ['Merkezcil kuvveti sürtünme sağlar: m v² / r ≤ k m g', `v<sup>2</sup> = k g r = 0,8 · 10 · 50 = 400 → <em>v = 20 m/s</em> ✓`], n: ['Kütle sadeleşir: güvenli hız kütleye bağlı değildir.'] } },
  ] });
  FZ.konuEk('AYT', 'Çembersel Hareket', { gorevler: [g12] });

  const sDon = FZ.taban('AYT', 'Dönme ve Açısal Momentum');
  const gDon = gorev(sDon, { yk: 'AYT17-g2', no: 2, icon: '📝', name: '12. sınıf yazılı soruları', task: 'Kaymadan yuvarlanma ve açısal momentumun korunumu. (1. dönem 1. yazılı)', steps: [
    { do: S => { S.L = 12; S.r = S.hedef = Math.SQRT1_2; }, sub: 'Platform dönüyor (I = 4 kg·m², ω = 3 rad/s).', go: '▶︎ Başlat' },
    { q: { t: 'Yarıçapı 0,5 m olan tekerlek kaymadan 4 rad/s açısal hızla yuvarlanıyor. Tekerleğin merkezinin hızı kaç m/s\'dir?', o: ['2 m/s', '8 m/s', '4 m/s', '0,125 m/s'],
      s: [`${FM('v<sub>merkez</sub> = ω · r')} = 4 · 0,5 = <em>2 m/s</em> ✓`], n: ['Kaymadan yuvarlanmada merkezin hızı ωr\'dir.'] } },
    { q: { t: 'Aynı tekerleğin en üst noktasının yere göre hızı kaç m/s\'dir?', o: ['4 m/s', '2 m/s', '0', '6 m/s'],
      s: ['En üstte öteleme (2 m/s) ve dönme (ωr = 2 m/s) hızları aynı yönde', 'v = 2 + 2 = <em>4 m/s</em> ✓'], n: ['Yere değen noktada ise hızlar zıt yönlüdür: 2 − 2 = 0.'] } },
    { q: { t: 'Tekerleğin yere değen noktasının o andaki hızı kaç m/s\'dir?', o: ['0', '2 m/s', '4 m/s', '1 m/s'],
      s: ['Öteleme hızı ileri, dönme hızı geri ve eşit büyüklükte → <em>0</em> ✓'], n: ['Bu yüzden "kaymadan" yuvarlanır: temas noktası yere göre kaymaz.'] } },
    { do: S => { S.hedef = 0; }, q: { t: 'Eylemsizlik momenti 4 kg·m² olan patenci 3 rad/s ile dönüyor. Kollarını kapatınca eylemsizlik momenti 2 kg·m²\'ye iniyor. Yeni açısal hızı kaç rad/s\'dir?', o: ['6 rad/s', '1,5 rad/s', '3 rad/s', '12 rad/s'], f: ['d17t'],
      s: ['Dış tork yok → açısal momentum korunur', `${FM('I<sub>1</sub> ω<sub>1</sub> = I<sub>2</sub> ω<sub>2</sub>')} → 4 · 3 = 2 · ω → <em>ω = 6 rad/s</em> ✓`], n: ['Kollarını kapatan patenci daha hızlı döner.'] } },
  ] });
  FZ.konuEk('AYT', 'Dönme ve Açısal Momentum', { gorevler: [gDon] });
})();
