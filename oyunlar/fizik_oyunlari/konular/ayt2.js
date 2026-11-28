// AYT 5 · İki Boyutta Hareket (Atışlar) — AYT 6 · Enerji ve Hareket — AYT 7 · İtme ve Çizgisel Momentum — AYT 8 · Tork ve Denge
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, levha, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const rad = d => d * Math.PI / 180;

  // =====================================================================
  // AYT 5 · ATIŞLAR — top atan namlu ve yörünge (1 birim = 20 m)
  // =====================================================================
  const K5 = 1 / 20;
  const s5 = sahne({ icon: '🏀', cam: [[1, 5, 22], [1, 1.8, 0]], plate: [24, 6, 3, 0],
    data: [['g', '10 m/s²'], ['Hava direnci', 'yok']],
    S0: () => ({ v0: 50, th: 37, tt: 0, kos: 0, mod: 'egik', h0: 0, iz: [] }),
    kur(g) {
      const namlu = silindir(g, 0.18, 0.22, 1.2, 0x334155, -8, 0.6, 0); const masa = kutu(g, 1.5, 1, 1.2, 0x92400e, -8, 0.5, 0); masa.visible = false;
      const t1 = top(g, 0.2, 0xf97316, -8, 0.6, 0), t2 = top(g, 0.2, 0x3b82f6, -8, 0.6, 0.6);
      const iz = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xb45309 })); g.add(iz);
      etiket('a5x', 'v<sub>x</sub>', '#16a34a'); etiket('a5y', 'v<sub>y</sub>', '#0891b2'); etiket('a5g', 'g', '#9333ea'); kart('a5t', '', '#F5C400');
      return { namlu, masa, t1, t2, iz, ox: ok(0x22c55e, 'a5x'), oy: ok(0x06b6d4, 'a5y'), og: ok(0xa855f7, 'a5g') };
    },
    tick(S, dt, o) {
      const yatay = S.mod === 'yatay', th = yatay ? 0 : rad(S.th), vx = S.v0 * Math.cos(th), vy0 = S.v0 * Math.sin(th);
      const ucus = yatay ? Math.sqrt(2 * S.h0 / 10) : 2 * vy0 / 10;
      if (S.kos) { S.tt = Math.min(ucus, S.tt + dt * 1.2); if (S.tt >= ucus) S.kos = 0; }
      const x = vx * S.tt, y = S.h0 + vy0 * S.tt - 5 * S.tt * S.tt, vy = vy0 - 10 * S.tt;
      o.masa.visible = yatay; o.masa.scale.y = S.h0 * K5; o.masa.position.y = S.h0 * K5 / 2;
      o.namlu.position.set(-8, S.h0 * K5 + 0.35, 0); o.namlu.rotation.z = -(Math.PI / 2 - th);
      const p = V3(-8 + x * K5, S.h0 * K5 + 0.2 + y * K5 - S.h0 * K5, 0); o.t1.position.copy(p);
      o.t2.visible = yatay; if (yatay) o.t2.position.set(-8, p.y, 0.8);
      if (S.kos) S.iz.push(p.clone()); o.iz.geometry.setFromPoints(S.iz.length > 1 ? S.iz : [p, p]);
      if (S.tt > 0) { FZ.setArrow(o.ox, p.clone().add(V3(0, 0, 0.4)), V3(1, 0, 0), vx / 25); FZ.show('a5x', p.clone().add(V3(vx / 25 + 0.3, 0, 0.4)), 1);
        if (Math.abs(vy) > 0.5) { FZ.setArrow(o.oy, p.clone().add(V3(0, 0, 0.4)), V3(0, Math.sign(vy), 0), Math.abs(vy) / 25); FZ.show('a5y', p.clone().add(V3(-0.4, vy / 25, 0.4)), 1); }
        FZ.setArrow(o.og, p.clone().add(V3(0.5, -0.2, 0.4)), V3(0, -1, 0), 0.6); FZ.show('a5g', p.clone().add(V3(0.75, -0.9, 0.4)), 1); }
      FZ.setTag('a5t', `t = ${fs(S.tt)} s · x = ${fs(x)} m · y = ${fs(y)} m`); FZ.show('a5t', V3(-2, 4.4, 0), S.tt > 0 ? 1 : 0);
    },
    qp: (at, S, o) => o.t1.position.clone().add(V3(0, 1.3, 0)) });
  const sifirla5 = S => { S.tt = 0; S.kos = 0; S.iz = []; };
  const d5 = ders(s5, { yk: 'AYT5-d1', no: 1, icon: '🎯', name: 'Top neden eğri çizer?', task: 'Yatay atış, eğik atış, tepe noktası, uçuş süresi ve menzil.', steps: [
    { k: { tur: 'merak', b: 'Masadan yatay itilen top mu, bırakılan top mu önce düşer?', m: ['Biri ileri doğru hızlı gidiyor, diğeri dümdüz düşüyor...', 'Atış hareketini iki ayrı harekete bölerek çözeceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { do: S => { S.mod = 'yatay'; S.h0 = 45; S.v0 = 20; sifirla5(S); }, p: { t: '45 m yükseklikten biri yatay atılıyor (turuncu), diğeri serbest bırakılıyor (mavi). Hangisi yere önce düşer?', o: ['Yatay atılan', 'Serbest bırakılan', 'İkisi aynı anda', 'Hıza bağlı, bilinemez'], d: 2 } },
    { sub: 'İkisini aynı anda bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Yükseklikleri her an aynı…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Hareketler birbirinden bağımsız', f: ['a5x', 'a5y', 'a5t'], m: ['Yatayda kuvvet yok → v<sub>x</sub> sabit. Düşeyde yalnız g → serbest düşme.', `İkisi de ${FM(`h = ${F('1', '2')} g t<sup>2</sup>`)} → t = 3 s sonra yere düşer. Yatay atılan 20 · 3 = 60 m ileriye.`] } },
    { do: S => { S.mod = 'egik'; S.h0 = 0; S.v0 = 50; S.th = 37; sifirla5(S); }, k: { tur: 'kavram', b: 'Eğik atış', m: [`${FM('v<sub>0x</sub> = v<sub>0</sub> cos θ')} (sabit) · ${FM('v<sub>0y</sub> = v<sub>0</sub> sin θ')} (her saniye 10 m/s azalır)`, `Tepeye çıkış: ${FM(`t<sub>ç</sub> = ${F('v<sub>0y</sub>', 'g')}`)} · uçuş: 2t<sub>ç</sub> · ${FM(`h<sub>max</sub> = ${F('v<sub>0y</sub><sup>2</sup>', '2g')}`)} · menzil = v<sub>0x</sub> · uçuş süresi`] } },
    { sub: '50 m/s, 37° ile atalım.', go: '▶︎ At' },
    { do: S => { S.kos = 1; }, sub: 'Top uçuyor; yeşil ok (v<sub>x</sub>) hiç değişmiyor.', until: S => !S.kos },
    { x: { b: 'Atış açısını değiştir', m: ['Aynı hızla farklı açılarda atın; menzil nasıl değişiyor?'],
      kay: [{ ad: 'th', etiket: 'Atış açısı', min: 15, max: 75, adim: 15, deger: 45, birim: '°', set: (S, v) => { S.th = v; sifirla5(S); S.kos = 1; } }],
      olc: S => { const R = 50 * 50 * Math.sin(rad(2 * S._th)) / 10; return `Menzil = ${F('v<sub>0</sub><sup>2</sup> sin 2θ', 'g')} = <em>${fs(R)} m</em><br>En uzak menzil 45°\'de. 30° ile 60° (toplamı 90°) aynı menzili verir.`; } } },
    { k: { tur: 'dikkat', b: 'Tepe noktasında hız sıfır değildir', m: ['Sık yanlış: "Tepede top durur."', 'Tepede yalnız <em>düşey</em> hız sıfırdır; yatay hız v<sub>0</sub> cos θ aynen sürer. İvme ise her an g (aşağı), tepede de.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Yatay: sabit hız. Düşey: g ivmeli hareket. İkisi bağımsız.', `${FM(`t<sub>ç</sub> = ${F('v<sub>0y</sub>', 'g')}`)} · ${FM(`h<sub>max</sub> = ${F('v<sub>0y</sub><sup>2</sup>', '2g')}`)} · menzil = v<sub>0x</sub> · 2t<sub>ç</sub>`] } },
  ] });
  const g5 = gorev(s5, { yk: 'AYT5-g1', no: 1, icon: '🎯', name: 'Hedefi vur', task: 'Eğik atışta tepe süresi, en büyük yükseklik, menzil ve tepedeki hızı bulun.', data: [['İlk hız', 'v₀ = 50 m/s'], ['Atış açısı', '37° (sin 0,6 · cos 0,8)'], ['g', '10 m/s²']], steps: [
    { do: S => { S.mod = 'egik'; S.th = 37; S.v0 = 50; }, sub: 'Top 50 m/s hızla, yatayla 37° açıyla atılacak.', go: '▶︎ At' },
    { q: { t: 'Top kaç saniyede tepe noktasına çıkar?', o: ['3 s', '4 s', '5 s', '6 s'], f: ['a5y'],
      s: ['v<sub>0y</sub> = 50 · sin 37° = 50 · 0,6 = 30 m/s', `${FM(`t<sub>ç</sub> = ${F('v<sub>0y</sub>', 'g')}`)} = ${F('30', '10')} = <em>3 s</em> ✓`], n: ['Tepeye çıkış süresini yalnız düşey hız belirler.'] } },
    { do: S => { S.kos = 1; }, sub: 'Top tepeye çıkıyor…', until: S => S.tt >= 3 },
    { do: S => { S.kos = 0; }, q: { t: 'Topun çıkabildiği en büyük yükseklik kaç m\'dir?', o: ['45 m', '90 m', '30 m', '125 m'], f: ['a5t'],
      s: ['§1. YOL · formül', `${FM(`h<sub>max</sub> = ${F('v<sub>0y</sub><sup>2</sup>', '2g')}`)} = ${F('900', '20')} = <em>45 m</em> ✓`, '§2. YOL · ortalama hız', `h = ${F('30 + 0', '2')} · 3 = <em>45 m</em> ✓`], n: ['Düşey hareket, 30 m/s ile yukarı atılmış bir cismin hareketiyle aynıdır.'] } },
    { q: { t: 'Tepe noktasında topun hızı kaç m/s\'dir?', o: ['40 m/s', '0', '30 m/s', '50 m/s'], f: ['a5x'],
      s: ['Tepede v<sub>y</sub> = 0, yatay hız değişmez:', `v = v<sub>0</sub> cos 37° = 50 · 0,8 = <em>40 m/s</em> ✓`], n: ['Sık yanlış: tepede hızın sıfır olduğunu düşünmek.'] } },
    { do: S => { S.kos = 1; }, q: { t: 'Top atıldığı seviyeye kaç m uzakta düşer (menzil)?', o: ['240 m', '120 m', '300 m', '150 m'],
      s: ['Uçuş süresi = 2 · 3 = 6 s', `menzil = v<sub>0x</sub> · t = 40 · 6 = <em>240 m</em> ✓`], n: ['Sürtünmesiz ortamda iniş süresi çıkış süresine eşittir.'] } },
  ] });
  konuEkle('AYT', 'İki Boyutta Hareket (Atışlar)', { dersler: [d5], gorevler: [g5] });

  // =====================================================================
  // AYT 6 · ENERJİ VE HAREKET — eğik düzlemden kayıp yaya çarpan blok
  // =====================================================================
  const s6 = sahne({ icon: '🛷', cam: [[3.5, 5, 20], [3.5, 1.8, 0]], plate: [16, 5, 0, 0],
    data: [['Bloğun kütlesi', 'm = 2 kg'], ['Yükseklik', 'h = 5 m'], ['g', '10 m/s²']],
    S0: () => ({ m: 2, h: 5, k: 800, kayip: 0, s: 0, kos: 0, sik: 0 }),
    kur(g) {
      const L = 6, H = 4, aci = Math.atan2(H, L);
      const ramp = FZ.mesh(new THREE.BoxGeometry(Math.hypot(L, H), 0.2, 1.4), 0x94a3b8); ramp.position.set(-5 + L / 2, H / 2, 0); ramp.rotation.z = -aci; g.add(ramp);
      kutu(g, 7, 0.2, 1.4, 0x94a3b8, 4.5, 0, 0); kutu(g, 0.3, 1.4, 1.4, 0x64748b, 7.9, 0.7, 0);
      const yay = new THREE.Group(); yay.position.set(7.75, 0.5, 0); g.add(yay);
      { const pts = []; for (let i = 0; i <= 200; i++) { const a = i / 200 * 8 * Math.PI * 2; pts.push(V3(-1.5 * i / 200, Math.sin(a) * 0.25, Math.cos(a) * 0.25)); } yay.add(FZ.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.04, 6, false), 0x22c55e, { edge: false })); }
      const blok = kutu(g, 0.7, 0.6, 0.7, 0xef4444, 0, 0, 0);
      kart('a6t', '', '#F5C400'); etiket('a6v', 'v', '#16a34a');
      return { L, H, aci, yay, blok, ov: ok(0x22c55e, 'a6v') };
    },
    tick(S, dt, o) {
      const yol = Math.hypot(o.L, o.H), duz = 4.9, E = S.m * 10 * S.h;
      const pos = s => s < yol ? V3(-5 + s * Math.cos(o.aci), o.H - s * Math.sin(o.aci) + 0.45, 0) : V3(1 + (s - yol), 0.4, 0);
      const yH = S.s < yol ? (1 - S.s / yol) * S.h : 0, isi = S.kayip * Math.min(1, S.s / yol), Ek = Math.max(0, E - S.m * 10 * yH - isi), v = Math.sqrt(2 * Ek / S.m);
      const xmax = v * Math.sqrt(S.m / S.k);
      if (S.kos) { if (S.s < yol + duz) S.s = Math.min(yol + duz, S.s + Math.max(0.6, v) * dt * 0.5); else { S.sik = Math.min(1, S.sik + dt * 1.5); if (S.sik >= 1) S.kos = 0; } }
      const p = pos(S.s); const sx = S.sik * Math.min(1.2, xmax * 2); p.x += sx; o.blok.position.copy(p); o.blok.rotation.z = S.s < yol ? -o.aci : 0;
      o.yay.scale.x = (1.5 - sx) / 1.5;
      const vv = S.sik > 0 ? v * Math.cos(S.sik * Math.PI / 2) : v;
      if (vv > 0.3) { FZ.setArrow(o.ov, p.clone().add(V3(0, 0.6, 0.5)), S.s < yol ? V3(Math.cos(o.aci), -Math.sin(o.aci), 0) : V3(1, 0, 0), vv / 8); FZ.show('a6v', p.clone().add(V3(0.6, 1.1, 0.5)), 1); }
      FZ.setTag('a6t', S.sik > 0 ? `Yay sıkışması: ${fs(xmax * S.sik)} m` : `v = ${fs(vv)} m/s`); FZ.show('a6t', V3(3, 3.2, 0), S.s > 0 ? 1 : 0);
    },
    qp: (at, S, o) => o.blok.position.clone().add(V3(0, 1.3, 0)) });
  const d6 = ders(s6, { yk: 'AYT6-d1', no: 1, icon: '🧲', name: 'İş enerjiyi nasıl değiştirir?', task: 'İş-enerji teoremi, yay potansiyel enerjisi, sürtünmeli yüzeyde enerji kaybı, güç ve verim.', steps: [
    { k: { tur: 'merak', b: 'Araba tamponları neden yaylı ya da esnektir?', m: ['Çarpışmada enerji bir yere gitmek zorundadır. Yay onu nasıl "saklar"?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'İş-enerji teoremi', m: [`${FM('W<sub>net</sub> = ΔE<sub>k</sub>')} · net kuvvetin yaptığı iş kinetik enerji değişimine eşittir.`, `Yay potansiyel enerjisi: ${FM(`E<sub>yay</sub> = ${F('1', '2')} k x<sup>2</sup>`)} (k: yay sabiti, x: sıkışma)`] } },
    { p: { t: 'Blok yaya 2 kat daha hızlı çarparsa yay kaç kat daha fazla sıkışır?', o: ['Aynı', '2 kat', '4 kat', SQ('2') + ' kat'], d: 1 } },
    { sub: 'Bloğu sürtünmesiz eğik düzlemden bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Blok kayıyor, sonra yayı sıkıştırıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Enerji yayda depolanır', f: ['a6t'], m: [`mgh = ${F('1', '2')} m v² = ${F('1', '2')} k x² → 100 J = ${F('1', '2')} · 800 · x² → x = 0,5 m`, `${F('1', '2')} m v² = ${F('1', '2')} k x² → x = v ${SQ(`${F('m', 'k')}`)} : hız 2 katına → sıkışma <em>2 katına</em>.`] } },
    { do: S => { S.s = 0; S.sik = 0; S.kayip = 36; }, k: { tur: 'kavram', b: 'Sürtünmenin işi', m: ['Sürtünme kuvveti harekete zıttır; yaptığı iş <em>negatiftir</em>.', 'Mekanik enerjinin bir kısmı ısıya dönüşür: E<sub>son</sub> = E<sub>ilk</sub> − W<sub>sürtünme</sub>. Şimdi düzlem sürtünmeli (36 J kayıp).'] } },
    { sub: 'Sürtünmeli düzlemde tekrar bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Blok kayıyor…', until: S => !S.kos },
    { k: { tur: 'ornek', b: 'Çözümlü örnek', f: ['a6t'], m: ['E<sub>k</sub> = 100 − 36 = 64 J → v = 8 m/s', `Yay: ${F('1', '2')} · 800 · x² = 64 → x = 0,4 m (sıkışma azaldı).`] } },
    { k: { tur: 'dikkat', b: 'Güç ve verim', m: [`${FM(`P = ${F('W', 't')}`)} · ${FM(`verim = ${F('yararlı iş', 'harcanan enerji')}`)}`, 'Hiçbir makinenin verimi %100 olamaz; kayıplar genelde ısıdır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('W<sub>net</sub> = ΔE<sub>k</sub>')} · ${FM(`E<sub>yay</sub> = ${F('1', '2')} k x<sup>2</sup>`)} · sürtünmenin işi ısıya gider.`] } },
  ] });
  const g6 = gorev(s6, { yk: 'AYT6-g1', no: 1, icon: '🧱', name: 'Yayı sıkıştır', task: 'Bloğun hızını, yaydaki sıkışmayı, sürtünme kaybını ve verimi hesaplayın.', data: [['Bloğun kütlesi', 'm = 2 kg'], ['Yükseklik', 'h = 5 m'], ['Yay sabiti', 'k = 800 N/m'], ['g', '10 m/s²']], steps: [
    { sub: '2 kg\'lık blok 5 m yükseklikteki sürtünmesiz eğik düzlemin tepesinde.', go: '▶︎ Bırak' },
    { q: { t: 'Blok düzlemin altına kaç m/s hızla ulaşır?', o: ['10 m/s', '100 m/s', '5 m/s', '7,1 m/s'],
      s: [`mgh = ${F('1', '2')} m v² → v = ${SQ('2 · 10 · 5')} = <em>10 m/s</em> ✓`], n: ['Sürtünmesiz eğik düzlemde hız yalnız yüksekliğe bağlıdır; eğim açısı önemli değildir.'] } },
    { do: S => { S.kos = 1; }, sub: 'Blok kayıyor…', until: S => !S.kos },
    { q: { t: 'Blok 800 N/m\'lik yaya çarpıyor. Yay en çok kaç m sıkışır?', o: ['0,5 m', '0,25 m', '1 m', '0,05 m'], f: ['a6t'],
      s: ['§1. YOL · enerji', `${F('1', '2')} · 800 · x² = 100 J → x² = 0,25 → <em>x = 0,5 m</em> ✓`, '§2. YOL · formül', `x = v ${SQ(F('m', 'k'))} = 10 · ${SQ(F('2', '800'))} = 10 · 0,05 = <em>0,5 m</em> ✓`], n: ['Yatay yol sürtünmesizse bloğun bütün kinetik enerjisi yayda depolanır.'] } },
    { do: S => { S.s = 0; S.sik = 0; S.kayip = 36; S.kos = 1; }, sub: 'Bu kez düzlem sürtünmeli…', until: S => !S.kos },
    { q: { t: 'Sürtünmeli düzlemde blok alta 8 m/s ile ulaşıyor. Sürtünme kuvvetinin yaptığı işin büyüklüğü kaç J\'dür?', o: ['36 J', '64 J', '100 J', '20 J'],
      s: [`E<sub>k</sub> = ${F('1', '2')} · 2 · 64 = 64 J`, `|W<sub>sürtünme</sub>| = 100 − 64 = <em>36 J</em> ✓`], n: ['Kaybolan mekanik enerji, sürtünmenin yaptığı (negatif) işe eşittir.'] } },
    { q: { t: '1000 W\'lık motor 400 kg\'lık yükü 10 s\'de 2 m yukarı çıkarıyor. Motorun verimi yüzde kaçtır?', o: ['%80', '%40', '%100', '%8'],
      s: ['Yararlı iş: m g h = 400 · 10 · 2 = 8000 J', 'Harcanan: P · t = 1000 · 10 = 10 000 J', `verim = ${F('8000', '10 000')} = <em>%80</em> ✓`], n: ['Kalan %20 (2000 J) sürtünme ve ısı olarak kaybolur.'] } },
  ] });
  konuEkle('AYT', 'Enerji ve Hareket', { dersler: [d6], gorevler: [g6] });

  // =====================================================================
  // AYT 7 · İTME VE ÇİZGİSEL MOMENTUM — rayda çarpışan iki araba
  // =====================================================================
  const s7 = sahne({ icon: '🎱', cam: [[3, 4.5, 19], [3, 1, 0]], plate: [18, 5, 0, 0],
    data: [['Momentum', 'p = m · v']],
    S0: () => ({ m1: 2, m2: 1, v1: 6, v2: 0, x1: -5, x2: 1, kos: 0, yapis: 1, carpti: 0 }),
    kur(g) {
      kutu(g, 16, 0.1, 0.12, 0x64748b, 0, 0.05, 0.4); kutu(g, 16, 0.1, 0.12, 0x64748b, 0, 0.05, -0.4);
      const A = FZ.labArabasi(g, 0x2563eb, 1.2), B = FZ.labArabasi(g, 0xdc2626, 1.0); A.position.y = B.position.y = 0.1;
      etiket('m7a', 'v<sub>1</sub>', '#2563eb'); etiket('m7b', 'v<sub>2</sub>', '#dc2626'); kart('m7t', '', '#F5C400');
      return { A, B, oa: ok(0x3b82f6, 'm7a'), ob: ok(0xef4444, 'm7b') };
    },
    tick(S, dt, o) {
      if (S.kos) { S.x1 += S.v1 * dt * 0.4; S.x2 += S.v2 * dt * 0.4;
        if (!S.carpti && S.x1 + 0.6 >= S.x2 - 0.5) { S.carpti = 1; FZ.SFX.clack(); const p = S.m1 * S.v1 + S.m2 * S.v2;
          if (S.yapis) { S.v1 = S.v2 = p / (S.m1 + S.m2); } else { const u1 = S.v1, u2 = S.v2, M = S.m1 + S.m2; S.v1 = ((S.m1 - S.m2) * u1 + 2 * S.m2 * u2) / M; S.v2 = ((S.m2 - S.m1) * u2 + 2 * S.m1 * u1) / M; } }
        if (S.x2 > 7.5 || S.x1 > 7.5) S.kos = 0; }
      FZ.tekerDondur(o.A, S.x1 - o.A.position.x); FZ.tekerDondur(o.B, S.x2 - o.B.position.x); o.A.position.x = S.x1; o.B.position.x = S.x2;
      if (Math.abs(S.v1) > 0.05) { FZ.setArrow(o.oa, V3(S.x1, 1.1, 0.5), V3(Math.sign(S.v1), 0, 0), Math.abs(S.v1) / 4); FZ.show('m7a', V3(S.x1 + S.v1 / 4 + 0.3 * Math.sign(S.v1), 1.1, 0.5), 1); }
      if (Math.abs(S.v2) > 0.05) { FZ.setArrow(o.ob, V3(S.x2, 1.6, 0.5), V3(Math.sign(S.v2), 0, 0), Math.abs(S.v2) / 4); FZ.show('m7b', V3(S.x2 + S.v2 / 4 + 0.3 * Math.sign(S.v2), 1.6, 0.5), 1); }
      const p = S.m1 * S.v1 + S.m2 * S.v2, Ek = 0.5 * S.m1 * S.v1 ** 2 + 0.5 * S.m2 * S.v2 ** 2;
      FZ.setTag('m7t', `v₁ = ${fs(S.v1)} · v₂ = ${fs(S.v2)} m/s<br>p<sub>toplam</sub> = ${fs(p)} kg·m/s · E<sub>k</sub> = ${fs(Ek)} J`); FZ.show('m7t', V3(4, 3.4, 0), 1);
    },
    qp: () => V3(0, 4, 0) });
  const d7 = ders(s7, { yk: 'AYT7-d1', no: 1, icon: '🥚', name: 'Çarpışmada ne korunur?', task: 'Momentum, itme, momentumun korunumu, esnek ve esnek olmayan çarpışma.', steps: [
    { k: { tur: 'merak', b: 'Yumurtayı yere değil yastığa atarsak neden kırılmaz?', m: ['Yumurtanın hızı iki durumda da sıfıra iner. Fark nerede?', 'Cevap için önce momentumu ve itmeyi tanıyalım.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Momentum ve itme', m: [`${FM('p = m · v')} (vektörel, kg·m/s)`, `İtme: ${FM('I = F · Δt = Δp')} · yastık Δt\'yi uzatır, aynı Δp için kuvvet küçülür.`] } },
    { p: { t: '2 kg\'lık araba 6 m/s ile duran 1 kg\'lık arabaya çarpıp <b>yapışıyor</b>. Ortak hızları kaç m/s olur?', o: ['6 m/s', '4 m/s', '3 m/s', '2 m/s'], d: 1 } },
    { sub: 'Arabaları çarpıştıralım.', go: '▶︎ Çarpıştır' },
    { do: S => { S.kos = 1; }, sub: 'Toplam momentumu izleyin…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Momentum korunur', f: ['m7t'], m: [`${FM('m<sub>1</sub>v<sub>1</sub> + m<sub>2</sub>v<sub>2</sub> = (m<sub>1</sub> + m<sub>2</sub>) v')} → 2 · 6 = 3 · v → v = 4 m/s`, 'Kinetik enerji ise 36 J\'den 24 J\'ye düştü: yapışan (esnek olmayan) çarpışmada enerjinin bir kısmı ısıya, sese gider.'] } },
    { do: S => { S.x1 = -5; S.x2 = 1; S.v1 = 6; S.v2 = 0; S.carpti = 0; S.yapis = 0; }, sub: 'Şimdi esnek çarpışma (yapışmadan).', go: '▶︎ Çarpıştır' },
    { do: S => { S.kos = 1; }, sub: 'Esnek çarpışma…', until: S => !S.kos },
    { k: { tur: 'kavram', b: 'Esnek çarpışma', f: ['m7t'], m: ['Esnek çarpışmada hem momentum hem kinetik enerji korunur.', 'Sonuç: v<sub>1</sub> = 2 m/s, v<sub>2</sub> = 8 m/s → p = 2·2 + 1·8 = 12 ✓, E<sub>k</sub> = 4 + 32 = 36 J ✓'] } },
    { x: { b: 'Kütleyi değiştir', m: ['Duran arabanın kütlesini değiştirin (yapışan çarpışma).'],
      kay: [{ ad: 'm2', etiket: 'm<sub>2</sub>', min: 1, max: 6, adim: 1, deger: 1, birim: 'kg', set: (S, v) => { S.m2 = v; } }],
      olc: S => `v = ${F('2 · 6', `2 + ${S._m2}`)} = <em>${fs(12 / (2 + S._m2))} m/s</em><br>Kütle arttıkça ortak hız azalır; toplam momentum hep 12 kg·m/s.` } },
    { do: S => { S.m2 = 1; S._m2 = 1; }, k: { tur: 'dikkat', b: 'Momentum vektöreldir', m: ['Top duvara 10 m/s ile çarpıp 10 m/s ile geri dönerse momentum değişimi <em>sıfır değildir</em>: Δp = m(10 − (−10)) = 20m.', 'Yön değişimi de momentum değişimidir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('p = m v')} · ${FM('F Δt = Δp')} · dış kuvvet yoksa toplam momentum korunur.`, 'Esnek: Ek de korunur. Yapışan: Ek azalır.'] } },
  ] });
  const g7 = gorev(s7, { yk: 'AYT7-g1', no: 1, icon: '🚃', name: 'Vagonları birleştir', task: 'Momentum, itme ve çarpışma sonrası hızları hesaplayın.', steps: [
    { do: S => { S.m1 = 4; S.v1 = 5; S.m2 = 1; }, sub: '4 kg\'lık araba 5 m/s ile 1 kg\'lık duran arabaya doğru gidiyor.', go: '▶︎ Başlat' },
    { q: { t: '3 kg\'lık bir cisim 4 m/s hızla gidiyor. Momentumu kaç kg·m/s\'dir?', o: ['12', '7', '24', '0,75'],
      s: [`${FM('p = m · v')} = 3 · 4 = <em>12 kg·m/s</em> ✓`], n: ['Momentum hız yönündedir.'] } },
    { q: { t: '0,5 kg\'lık top duvara 20 m/s ile dik çarpıp 20 m/s ile geri dönüyor. Momentumdaki değişmenin büyüklüğü kaç kg·m/s\'dir?', o: ['20', '0', '10', '40'],
      s: ['Δp = m (v<sub>son</sub> − v<sub>ilk</sub>) = 0,5 · (−20 − 20)', '|Δp| = <em>20 kg·m/s</em> ✓'], n: ['Sık yanlış: hızların büyüklüğü aynı olduğu için Δp = 0 demek. Yön değişti!'] } },
    { q: { t: 'Top duvara 0,02 s temas ediyorsa duvarın topa uyguladığı ortalama kuvvet kaç N\'dur?', o: ['1000 N', '400 N', '20 N', '2000 N'],
      s: [`${FM('F · Δt = Δp')} → F = ${F('20', '0,02')} = <em>1000 N</em> ✓`], n: ['Temas süresi kısaldıkça kuvvet büyür; hava yastığı süreyi uzatarak kuvveti azaltır.'] } },
    { do: S => { S.kos = 1; }, sub: 'Arabalar çarpışıp yapışıyor…', until: S => !S.kos },
    { q: { t: '4 kg\'lık araba 5 m/s ile duran 1 kg\'lık arabaya çarpıp yapışıyor. Ortak hızları kaç m/s\'dir?', o: ['4 m/s', '5 m/s', '2,5 m/s', '1 m/s'], f: ['m7t'],
      s: ['Momentum korunur: 4 · 5 + 1 · 0 = (4 + 1) v', `v = ${F('20', '5')} = <em>4 m/s</em> ✓`], n: ['Çarpışma süresince dış kuvvetler ihmal edilir; iç kuvvetler momentumu değiştirmez.'] } },
  ] });
  konuEkle('AYT', 'İtme ve Çizgisel Momentum', { dersler: [d7], gorevler: [g7] });

  // =====================================================================
  // AYT 8 · TORK VE DENGE — destek üzerinde çubuk ve ağırlıklar
  // =====================================================================
  const s8 = sahne({ icon: '⚖️', cam: [[1.6, 4.5, 15], [1.6, 2, 0]], plate: [14, 6, 0, 0],
    data: [['Tork', 'τ = F · d']],
    S0: () => ({ W1: 30, d1: 2, W2: 20, d2: 3, ac: 0, goster2: 1 }),
    kur(g) {
      const destek = FZ.mesh(new THREE.ConeGeometry(0.5, 1.6, 4), 0x64748b); destek.position.set(0, 0.8, 0); g.add(destek);
      const kol = new THREE.Group(); kol.position.set(0, 1.65, 0); g.add(kol);
      kutu(kol, 9, 0.18, 0.5, 0xf59e0b, 0, 0, 0); for (let i = -4; i <= 4; i++) kutu(kol, 0.04, 0.2, 0.52, 0x111827, i, 0, 0, { edge: false });
      const y1 = FZ.agirlik(kol, 0xef4444, 0.75, 0.28), y2 = FZ.agirlik(kol, 0x3b82f6, 0.6, 0.24); y1.position.set(-2, -0.95, 0); y2.position.set(3, -0.8, 0); [[y1, 0.75], [y2, 0.6]].forEach(([y, h]) => silindir(y, 0.012, 0.012, 0.24, 0x111827, 0, h + 0.1, 0, { edge: false }));   // asma ipi   // kancalı laboratuvar kütleleri
      kart('t8a', '', '#ef4444'); kart('t8b', '', '#3b82f6'); kart('t8t', '', '#F5C400');
      return { kol, y1, y2 };
    },
    tick(S, dt, o) {
      const net = S.W2 * S.d2 * (S.goster2 ? 1 : 0) - S.W1 * S.d1, hedef = Math.abs(net) < 0.01 ? 0 : -Math.sign(net) * 0.35;   // dengesizse çubuk büyük tork yönünde dayanak sınırına kadar döner (ara açıda denge yok)
      o.kol.rotation.z += (hedef - o.kol.rotation.z) * Math.min(1, dt * 3);
      o.y1.position.x = -S.d1; o.y2.position.x = S.d2; o.y2.visible = !!S.goster2;
      [o.y1, o.y2].forEach(y => y.rotation.z = -o.kol.rotation.z);
      const w = (y) => y.getWorldPosition(V3());
      FZ.setTag('t8a', `${S.W1} N · ${S.d1} m`); FZ.show('t8a', w(o.y1).add(V3(0, -0.8, 0)), 1);
      FZ.setTag('t8b', `${S.W2} N · ${S.d2} m`); FZ.show('t8b', w(o.y2).add(V3(0, -0.8, 0)), S.goster2 ? 1 : 0);
      FZ.setTag('t8t', Math.abs(net) < 0.01 ? 'Στ = 0 → DENGE ✓' : `Net tork: ${fs(Math.abs(net))} N·m (${net > 0 ? 'saat yönünde' : 'saat yönüne ters'})`); FZ.show('t8t', V3(0, 4, 0), 1);
    },
    qp: () => V3(0, 4.6, 0) });
  const d8 = ders(s8, { yk: 'AYT8-d1', no: 1, icon: '🚪', name: 'Kapı kolu neden menteşeden uzaktadır?', task: 'Tork (kuvvet momenti), denge şartları, tahterevalli problemleri.', steps: [
    { k: { tur: 'merak', b: 'Kapıyı menteşenin yanından itmek neden zordur?', m: ['Aynı kuvvetle kapıyı kolundan itince kolayca açılır, menteşeye yakın itince zor.', 'Döndürme etkisi yalnız kuvvete değil, <em>uzaklığa</em> da bağlıdır.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Tork', m: [`${FM('τ = F · d')} · d: dönme noktasından kuvvetin doğrultusuna <em>dik</em> uzaklık (N·m)`, 'Saat yönünde ve saat yönüne ters torklar birbirini dengeleyebilir.'] } },
    { do: S => { S.goster2 = 0; }, p: { t: 'Çubukta destekten 2 m solda 30 N var. Destekten 3 m sağa kaç N asarsak çubuk dengede kalır?', o: ['30 N', '20 N', '45 N', '10 N'], d: 1 } },
    { sub: 'Sağ tarafa 20 N\'luk yükü asalım.', go: '▶︎ Yükü as' },
    { do: S => { S.goster2 = 1; }, sub: 'Çubuk dengeye geliyor…', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Denge şartı', f: ['t8t', 't8a', 't8b'], m: [`Sol: 30 · 2 = 60 N·m · Sağ: 20 · 3 = 60 N·m → ${FM('Στ = 0')}`, `Ayrıca ${FM('ΣF = 0')}: destek, 30 + 20 = 50 N yukarı tepki uygular.`] } },
    { x: { b: 'Mavi yükü kaydır', m: ['Mavi yükün destekten uzaklığını değiştirin.'],
      kay: [{ ad: 'd2', etiket: 'Mavi yük uzaklığı', min: 1, max: 4, adim: 0.5, deger: 3, birim: 'm', set: (S, v) => { S.d2 = v; } }],
      olc: S => `Sağ tork: 20 · ${fs(S._d2)} = <em>${fs(20 * S._d2)} N·m</em> · sol: 60 N·m<br>${20 * S._d2 > 60 ? 'Sağ ağır basıyor' : 20 * S._d2 < 60 ? 'Sol ağır basıyor' : 'Denge!'}` } },
    { do: S => { S.d2 = 3; S._d2 = 3; }, k: { tur: 'dikkat', b: 'Dik uzaklık', m: ['Kuvvet çubuğa eğik uygulanırsa yalnız <em>dik bileşeni</em> döndürür: τ = F · d · sin θ.', 'Kuvvetin doğrultusu dönme noktasından geçerse tork sıfırdır.'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek: ağırlıklı çubuk', m: ['Düzgün çubuğun ağırlığı orta noktasına etki eder.', '4 m uzunluğunda, 40 N\'luk çubuk sol ucundan 1 m uzaktaki destekte duruyor. Sol uca kaç N asılmalı?', 'Çubuğun ağırlığı destekten 1 m sağda: 40 · 1 = W · 1 → <em>W = 40 N</em>'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('τ = F · d')} · denge: ${FM('ΣF = 0')} ve ${FM('Στ = 0')}`, 'Düzgün çubuğun ağırlığı orta noktasından etki eder.'] } },
  ] });
  const g8 = gorev(s8, { yk: 'AYT8-g1', no: 1, icon: '🎠', name: 'Tahterevalliyi dengele', task: 'Tork, denge ve destek tepki kuvvetini hesaplayın.', steps: [
    { do: S => { S.W1 = 60; S.d1 = 1; S.goster2 = 0; S.W2 = 20; S.d2 = 3; }, sub: 'Sol tarafta 60 N\'luk yük destekten 1 m uzakta.', go: '▶︎ Başlat' },
    { q: { t: 'Uzunluğu 0,5 m olan anahtara uca dik 40 N kuvvet uygulanıyor. Tork kaç N·m\'dir?', o: ['20 N·m', '80 N·m', '40 N·m', '0,0125 N·m'],
      s: [`${FM('τ = F · d')} = 40 · 0,5 = <em>20 N·m</em> ✓`], n: ['Daha uzun anahtar aynı kuvvetle daha büyük tork sağlar.'] } },
    { q: { t: 'Destekten 1 m solda 60 N var. Dengeleme için destekten 3 m sağa kaç N\'luk yük asılmalı?', o: ['20 N', '60 N', '180 N', '30 N'], f: ['t8a', 't8t'],
      s: [`${FM('Στ = 0')}: 60 · 1 = W · 3 → <em>W = 20 N</em> ✓`], n: ['Uzaklık 3 kat → gereken kuvvet 3\'te 1.'] } },
    { do: S => { S.goster2 = 1; }, q: { t: 'Kütlesiz çubuk dengede. Desteğin çubuğa uyguladığı tepki kuvveti kaç N\'dur?', o: ['80 N', '60 N', '40 N', '20 N'], f: ['t8t', 't8a', 't8b'],
      s: [`${FM('ΣF = 0')}: N = 60 + 20 = <em>80 N</em> ✓`], n: ['Tork dengesi kadar kuvvet dengesi de sağlanmalı.'] } },
    { q: { t: '4 m uzunluğunda, 40 N ağırlığındaki düzgün çubuk sol ucundan 1 m uzaktaki destekte duruyor. Yatay dengede kalması için sol uca kaç N asılmalıdır?', o: ['40 N', '20 N', '80 N', '120 N'],
      s: ['Çubuğun ağırlığı orta noktada: destekten 2 − 1 = 1 m sağda', `${FM('Στ = 0')}: W · 1 = 40 · 1 → <em>W = 40 N</em> ✓`], n: ['Düzgün (türdeş) çubuğun ağırlık merkezi tam ortasıdır.'] } },
  ] });
  konuEkle('AYT', 'Tork ve Denge', { dersler: [d8], gorevler: [g8] });
})();
