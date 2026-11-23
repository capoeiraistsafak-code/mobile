// Kitap soru bankası · TYT DALGALAR (yay/ip atmaları, yansıma–iletim, su dalgaları, ses, deprem)
// Benim Hocam TYT s.211–240'taki SORU TİPLERİ örnek alınmıştır; sorular, sayılar ve durumlar özgündür.
// Sahne "Dalga laboratuvarı": ip/yay (atma, sabit–serbest uç, ince–kalın geçiş), dalga leğeni (derin–sığ), hoparlör ve ses.
(function () {
  const { V3, sahne, gorev, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const NB = 90, Y0 = 1.4;

  const sDl = sahne({ icon: '〰️', cam: [[0, 3.4, 13], [0, 1.4, 0]], plate: [16, 8, 0, 0],
    data: [['Dalga hızı', 'v = λ · f'], ['Periyot', 'T = 1 / f'], ['Ses (hava, 20 °C)', 'v ≈ 340 m/s']],
    S0: () => ({ mod: 'ip', t: 0, uc: 'sabit', iki: 0, v1: 2, v2: 1, A: 0.8, w: 0.5, cevap: 0, lam1: 1.2, lam2: 0.6, f: 1, dairesel: 0, sesler: [], kay: 0 }),
    cam2: S => S.mod === 'legen' ? [[0, 9.5, 4.5], [0, 0, 0]] : S.mod === 'ses' ? [[0.4, 2.4, 10.5], [0.4, 2.0, 0]] : [[0, 3.4, 13], [0, 1.4, 0]],
    kur(g) {
      const T = {};
      T.bon = []; for (let i = 0; i < NB; i++) T.bon.push(top(g, 0.1, 0x60a5fa, -6 + 12 * i / (NB - 1), Y0, 0, { edge: false }));
      T.duvar = kutu(g, 0.4, 3.2, 1.2, 0x64748b, 6.25, 1.6, 0); T.cubuk = silindir(g, 0.05, 0.05, 3, 0xcbd5e1, 6.1, 1.5, 0, { edge: false }); T.halka = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 16), FZ.metal()); T.halka.rotation.y = Math.PI / 2; g.add(T.halka);
      T.el = kutu(g, 0.3, 3, 0.3, 0x475569, -6.3, 1.5, 0);
      // dalga leğeni: su, takoz (sığ bölge), kaynak, dalga tepeleri
      T.su = kutu(g, 12, 0.1, 6, 0x0ea5e9, 0, -0.05, 0, { op: 0.55, edge: false }); T.takoz = kutu(g, 6, 0.05, 6, 0x0c4a6e, 3, 0.02, 0, { op: 0.6, edge: false });
      T.cubukK = kutu(g, 0.2, 0.3, 5.6, 0x334155, -5.6, 0.15, 0); T.nokta = top(g, 0.18, 0x334155, -4, 0.15, 0);
      T.tepe = []; for (let i = 0; i < 26; i++) { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(), V3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x082f49 })); l.visible = false; g.add(l); T.tepe.push(l); }
      T.serit = []; for (let i = 0; i < 26; i++) { const m = kutu(g, 0.1, 0.04, 6, 0xffffff, 0, 0.08, 0, { edge: false }); m.material.emissive = new THREE.Color(0xe0f2fe); m.material.emissiveIntensity = 0.6; m.visible = false; T.serit.push(m); }   // doğrusal dalga tepeleri (parlak şerit)
      // ses: hoparlör, hava tanecikleri, osilogram ekranı
      T.hop = new THREE.Group(); g.add(T.hop); kutu(T.hop, 1, 1.6, 1, 0x1f2937, 0, 0.8, 0); const kon = silindir(T.hop, 0.42, 0.18, 0.2, 0x9ca3af, 0.55, 0.85, 0, { edge: false }); kon.rotation.z = Math.PI / 2; top(T.hop, 0.1, 0x111827, 0.62, 0.85, 0);
      T.hava = []; for (let r = 0; r < 4; r++) for (let i = 0; i < 40; i++) T.hava.push(top(g, 0.045, 0x93c5fd, 0, 0, 0, { edge: false }));
      T.ekran = kutu(g, 7, 2.2, 0.1, 0x0f172a, 0.6, 3.0, -0.6); T.egri = [0xfacc15, 0x22c55e].map(r => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(), V3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: r })); l.visible = false; g.add(l); return l; });
      ['dlA', 'dlB', 'dlC', 'dlD'].forEach((id, i) => kart(id, '', ['#F5C400', '#22c55e', '#ef4444', '#3b82f6'][i]));
      return T;
    },
    tick(S, dt, T) {
      const ip = S.mod === 'ip', leg = S.mod === 'legen', ses = S.mod === 'ses';
      T.bon.forEach(b => b.visible = ip); T.el.visible = ip; T.duvar.visible = ip && !S.iki && S.uc === 'sabit'; T.cubuk.visible = T.halka.visible = ip && !S.iki && S.uc === 'serbest';
      [T.su, T.takoz, T.cubukK, T.nokta].forEach(o => o.visible = false); T.tepe.forEach(l => l.visible = false); T.serit.forEach(m => m.visible = false);
      T.hop.visible = ses; T.hava.forEach(h => h.visible = ses); T.ekran.visible = ses; T.egri.forEach(l => l.visible = false);
      const tag = (id, txt, p, op = 1) => { FZ.setTag(id, txt); FZ.show(id, p, op); };
      if (ip) {                                          // atma: gelen + yansıyan + iletilen (ince–kalın yayda genlik katsayıları R, T)
        S.t += dt; const g_ = x => Math.exp(-(x * x) / (2 * S.w * S.w));
        const L = 6, xp = -6 + S.v1 * S.t; let tY = 0, R = 0, Tr = 0;
        if (S.iki) { R = (S.v2 - S.v1) / (S.v1 + S.v2); Tr = 2 * S.v2 / (S.v1 + S.v2); } else R = S.uc === 'sabit' ? -1 : 1;
        const sinir = S.iki ? 0 : L, gec = xp - sinir;                       // sınırdan ne kadar geçti (gelen atma)
        if (S.t > (sinir + 6) / S.v1 + (S.iki ? 6 / Math.min(S.v1, S.v2) : 6 / S.v1) + 0.6) S.t = 0;
        T.bon.forEach((b, i) => { const x = -6 + 12 * i / (NB - 1); let y = 0;
          if (S.dizi) { const on = -6 + S.v1 * S.t; y = x < on ? 0.6 * Math.sin(2 * Math.PI * (on - x) / S.dizi) : 0; if (on > 30) S.t = 0; b.position.y = Y0 + y; b.scale.setScalar(1); b.material.color.setHex(0x60a5fa); return; }
          if (S.karsi) { const xa = -6 + S.v1 * S.t, xb = 6 - S.v1 * S.t; y = S.karsi[0] * g_(x - xa) + S.karsi[1] * g_(x - xb); if (xa > 7) S.t = 0; b.position.y = Y0 + y; b.scale.setScalar(1); b.material.color.setHex(0x60a5fa); return; }
          const sol = !S.iki || x <= 0;
          if (sol) { if (x <= sinir) { y += S.A * g_(x - xp); if (gec > -3 * S.w) y += R * S.A * g_(x - (2 * sinir - xp)); } }
          else if (gec > -3 * S.w) y += Tr * S.A * g_(x - gec * S.v2 / S.v1);
          b.position.y = Y0 + y; const kalin = S.iki && x > 0 && S.v2 < S.v1, ince = S.iki && x > 0 && S.v2 > S.v1;
          b.scale.setScalar(kalin ? 1.8 : ince ? 0.6 : 1); b.material.color.setHex(S.iki && x > 0 ? 0xf97316 : 0x60a5fa); });
        if (S.dizi || S.karsi) { T.duvar.visible = T.cubuk.visible = T.halka.visible = false; if (S.etiket) tag('dlD', S.etiket, V3(-3, Y0 - 1.6, 0)); return; }
        if (!S.iki) { T.halka.position.set(6.1, Y0 + (gec > -3 * S.w ? S.A * g_(L - xp) * 2 : 0), 0); }
        tag('dlA', S.iki ? (S.v2 < S.v1 ? 'ince yay → kalın yay' : 'kalın yay → ince yay') : (S.uc === 'sabit' ? 'sabit uç (duvara bağlı)' : 'serbest uç (halka çubukta kayar)'), V3(0, 3.6, 0));
        if (S.cevap && gec > 1) { tag('dlB', R < 0 ? 'yansıyan: ters' : 'yansıyan: düz', V3(Math.min(-1, 2 * sinir - xp), Y0 - 1.1, 0)); if (S.iki) tag('dlC', 'iletilen: düz', V3(Math.min(5, gec * S.v2 / S.v1), Y0 + 1.4, 0)); }
        if (S.etiket) tag('dlD', S.etiket, V3(-3, Y0 - 1.6, 0));
      } else if (leg) {                                  // dalga leğeni (üstten): derin bölge solda, sığ bölge (takoz) sağda
        T.su.visible = true; T.takoz.visible = !!S.sig; S.t += dt;
        const ph = (S.t * S.f) % 1, x0 = -5.5;
        if (S.dairesel) { T.nokta.visible = true; T.nokta.position.set(-4, 0.15, 0); let n = 0;
          for (let k = 0; k < 26 && n < 26; k++) { const r = (ph + k) * S.lam1; if (r > 9) break; const pts = []; for (let a = 0; a <= 64; a++) { const an = a / 64 * Math.PI * 2, x = -4 + r * Math.cos(an), z = r * Math.sin(an); if (Math.abs(x) < 6 && Math.abs(z) < 3) pts.push(V3(x, 0.06, z)); else if (pts.length) break; }
            if (pts.length > 1) { FZ.setLine(T.tepe[n], pts); n++; } } }
        else { T.cubukK.visible = true;
          for (let k = 0; k < 26; k++) { const sd = (ph + k) * S.lam1; let x = x0 + sd; if (S.sig && x > 0) x = (sd - (0 - x0)) * S.lam2 / S.lam1; if (x > 6) break; T.serit[k].visible = true; T.serit[k].position.x = x; } }
        tag('dlA', `derin bölge · λ₁ = ${fs(S.lam1 * 2)} cm`, V3(-3, 0.3, -2.4));
        if (S.sig) tag('dlB', S.cevap ? `sığ bölge · λ₂ = ${fs(S.lam2 * 2)} cm` : 'sığ bölge · λ₂ = ?', V3(3, 0.3, -2.4));
        if (S.etiket) tag('dlD', S.etiket, V3(0, 0.3, 2.6));
      } else if (ses) {                                  // hoparlör: hava tanecikleri ileri–geri (boyuna dalga), ekranda ses dalgaları
        S.t += dt; T.hop.position.set(-3.9, 0, 0); const k = 2 * Math.PI / 1.6, w = 2 * Math.PI * 0.8;
        T.hava.forEach((h, i) => { const r = Math.floor(i / 40), j = i % 40, x0 = -3.1 + j * 0.2; h.position.set(x0 + 0.1 * Math.sin(k * x0 - w * S.t), 0.35 + r * 0.32, 0); });
        (S.sesler || []).forEach(([A, f], n) => { const pts = []; for (let i = 0; i <= 160; i++) { const x = -2.6 + 6.4 * i / 160; pts.push(V3(x, 3.0 + (n ? -0.5 : 0.5) + A * 0.35 * Math.sin(2 * Math.PI * f * (x + 3) / 3), -0.5)); } FZ.setLine(T.egri[n], pts);
          tag(n ? 'dlB' : 'dlA', n ? 'L sesi' : 'K sesi', V3(4.3, 3.0 + (n ? -0.5 : 0.5), -0.5)); });
        if (S.etiket) tag('dlD', S.etiket, V3(0.5, -0.4, 0));
      }
    },
    qp: () => V3(0, 4.2, 0) });

  const M = (S, mod, o) => Object.assign(S, { mod, t: 0, cevap: 0, etiket: '', iki: 0, sig: 0, dairesel: 0, sesler: [], dizi: 0, karsi: 0, v1: 2, v2: 1 }, o);
  const ALT = { ip: 'Gergin yay üzerinde atma.', legen: 'Dalga leğeni (üstten görünüm).', ses: 'Hoparlör, hava tanecikleri ve osilogram ekranı.' };
  const st = (o, q) => ({ do: S => M(S, o.mod, o), sub: ALT[o.mod], q: Object.assign({ goster: S => { S.cevap = 1; } }, q) });

  // ======================= GÖREV A · Yay ve ip dalgaları =======================
  const gA = gorev(sDl, { yk: 'TYT9-g2', no: 2, icon: '🪀', name: 'Kitap soruları: yay dalgaları ve atmalar', task: 'λ, f, T, v = λf; atma hızı; sabit ve serbest uçta yansıma; ince–kalın yay geçişi; girişim.', steps: [
    { do: S => M(S, 'ip', { uc: 'sabit' }), sub: 'Dalga laboratuvarı: yay, dalga leğeni ve hoparlör.', go: '▶︎ Başla' },
    st({ mod: 'ip', dizi: 3, v1: 3, etiket: '4 tepe arası 90 cm' }, { t: 'Bir yay dalgasında art arda 4 tepe arasındaki uzaklık 90 cm\'dir. Dalga boyu kaç cm\'dir?', o: ['30', '22,5', '45', '90'], b: ['Dalga boyu (λ): art arda iki tepe arasındaki uzaklık.'],
      s: ['4 tepe arasında 3 dalga boyu vardır.', 'λ = 90 / 3 = <em>30 cm</em> ✓'], n: ['Sık yanlış: tepe sayısına bölmek. n tepe arasında (n − 1) dalga boyu vardır.'] }),
    st({ mod: 'ip', dizi: 2, v1: 3 }, { t: 'Kaynak 4 saniyede 20 titreşim yapıyor ve dalga boyu 0,5 m. Dalganın yayılma hızı kaç m/s\'dir?', o: ['2,5', '10', '5', '0,1'],
      s: [`f = ${F('20', '4')} = 5 Hz`, `${FM('v = λ · f')} = 0,5 · 5 = <em>2,5 m/s</em> ✓`], n: ['Frekans: 1 saniyedeki titreşim sayısı. Periyot: bir titreşimin süresi, T = 1/f = 0,2 s.'] }),
    st({ mod: 'ip', uc: 'sabit' }, { t: 'Gergin bir yayda atmanın hızını artırmak için aşağıdakilerden hangisi yapılmalıdır?', o: ['Yayı daha çok germek', 'Elin titreşim frekansını artırmak', 'Atmanın genliğini büyütmek', 'Aynı yayı daha hızlı sallamak'],
      b: [`Yaydaki atma hızı: ${FM(`v = √${F('F', 'μ')}`)} (F: gerilme kuvveti, μ: birim uzunluğun kütlesi)`],
      s: ['Atma hızı yalnız ortama bağlıdır: gerilme kuvveti (F) ve yayın birim uzunluğunun kütlesi (μ).', 'F artarsa v artar → <em>yayı daha çok germek</em> ✓'], n: ['Frekans ve genlik kaynağa bağlıdır; hızı değiştirmez.', 'Daha kalın (μ büyük) yayda atma yavaştır.'] }),
    st({ mod: 'ip', uc: 'sabit' }, { t: 'Yukarı doğru tümsek biçimli atma, ucu duvara sabitlenmiş yaydan yansıyor. Yansıyan atma nasıldır?', o: ['Ters (çukur) döner', 'Düz (tümsek) döner', 'Yansımaz, duvarda söner', 'Genliği iki katına çıkar'],
      s: ['Sabit uç atmanın ucu kaldırmasına izin vermez; duvar yaya aşağı yönlü tepki uygular.', 'Yansıyan atma <em>ters</em> döner ✓; hızı ve genişliği değişmez.'], n: ['Serbest uçta (halka çubukta kayabiliyorsa) yansıyan atma düz döner.'] }),
    st({ mod: 'ip', uc: 'serbest' }, { t: 'Yayın ucu, sürtünmesiz düşey çubukta kayabilen bir halkaya bağlıysa tümsek atma nasıl yansır?', o: ['Düz (tümsek) yansır', 'Ters (çukur) yansır', 'Hiç yansımaz', 'İkiye bölünür'],
      s: ['Serbest uç atmayla birlikte yukarı kalkar ve yayı geri çeker.', 'Yansıyan atma <em>düz</em> döner ✓'], n: ['Sabit uç → ters, serbest uç → düz yansıma.'] }),
    st({ mod: 'ip', iki: 1, v1: 2, v2: 1 }, { t: 'İnce yaydan kalın yaya geçen tümsek atmanın iletilen ve yansıyan kısımları nasıldır?', o: ['İletilen düz, yansıyan ters', 'İletilen ters, yansıyan düz', 'İkisi de düz', 'İkisi de ters'],
      b: ['Kalın yay, ince yaya göre "duvar gibi" davranır (atma kalın yayda daha yavaştır).'],
      s: ['İletilen atma her zaman <em>düz</em> geçer.', 'Kalın yay sabit uca benzer → yansıyan <em>ters</em> ✓'], n: ['Kalından inceye geçişte ise yansıyan atma düz döner (serbest uca benzer).', 'Geçişte frekans değişmez; hız ve dalga boyu değişir.'] }),
    st({ mod: 'ip', iki: 1, v1: 1, v2: 2 }, { t: 'Kalın yaydan ince yaya geçen atmanın iletilen kısmının hızı için ne söylenir?', o: ['Artar', 'Azalır', 'Değişmez', 'Sıfır olur'],
      b: [`Atma hızı: ${FM(`v = √${F('F', 'μ')}`)} · iki yayın gerilme kuvveti aynıdır.`],
      s: ['İnce yayda μ küçük → v büyük: iletilen atma <em>hızlanır</em> ✓', 'Yansıyan atma düz döner.'], n: ['Gerilme kuvveti birleşik yayın her yerinde aynıdır; farkı μ yaratır.'] }),
    st({ mod: 'ip', karsi: [0.9, 0.6], v1: 1.5, etiket: 'genlikler 3 cm ve 2 cm' }, { t: 'Genlikleri 3 cm ve 2 cm olan iki tümsek atma bir yayda karşılaşıyor. Tam üst üste geldikleri anda genlik kaç cm olur?', o: ['5', '1', '6', '2,5'],
      s: ['Aynı yönlü atmalar üst üste gelince genlikler toplanır (yapıcı girişim).', '3 + 2 = <em>5 cm</em> ✓'], n: ['Biri tümsek biri çukur olsaydı 3 − 2 = 1 cm olurdu (yıkıcı girişim).', 'Karşılaştıktan sonra atmalar birbirini etkilemeden yollarına devam eder.'] }),
    st({ mod: 'ip', dizi: 2.5, v1: 3 }, { t: 'Dalga boyu 40 cm, periyodu 0,2 s olan dalganın hızı kaç cm/s\'dir?', o: ['200', '8', '80', '20'],
      s: [`${FM(`v = ${F('λ', 'T')}`)} = ${F('40', '0,2')} = <em>200 cm/s</em> ✓`], n: ['1. YOL: v = λ/T · 2. YOL: f = 1/T = 5 Hz → v = λ · f = 40 · 5 = 200 cm/s'] }),
  ] });

  // ======================= GÖREV B · Su dalgaları, ses, deprem =======================
  const gB = gorev(sDl, { yk: 'TYT9-g3', no: 3, icon: '🌊', name: 'Kitap soruları: su dalgaları ve ses', task: 'Derin–sığ geçiş, tsunami, yansıma, stroboskop; ses hızı, yükseklik, şiddet, tını, yankı; deprem.', steps: [
    { do: S => M(S, 'legen', { lam1: 0.8, lam2: 0.4, sig: 1, f: 0.6 }), sub: 'Dalga leğeni: sol taraf derin, sağ taraf sığ.', go: '▶︎ Başla' },
    st({ mod: 'legen', lam1: 0.8, lam2: 0.4, sig: 1, f: 0.6 }, { t: 'Doğrusal su dalgaları derin bölgeden sığ bölgeye geçiyor. Derin bölgede dalga boyu 1,6 cm, hız 16 cm/s; sığ bölgede hız 8 cm/s. Sığ bölgede dalga boyu kaç cm olur?', o: ['0,8', '1,6', '3,2', '0,4'], f: ['dlA', 'dlB'], gizle: ['dlB'],
      s: ['Ortam değişince frekans değişmez: f = v / λ = 16 / 1,6 = 10 Hz', `λ₂ = ${F('v₂', 'f')} = ${F('8', '10')} = <em>0,8 cm</em> ✓`], n: ['Su dalgalarında sığ bölgede hız azalır; frekans sabit olduğu için dalga boyu da azalır.'] }),
    st({ mod: 'legen', lam1: 0.8, lam2: 0.4, sig: 1, f: 0.6 }, { t: 'Açık denizde oluşan tsunami dalgası kıyıya yaklaşırken aşağıdakilerden hangisi artar?', o: ['Genliği', 'Hızı', 'Dalga boyu', 'Frekansı'],
      b: ['Su dalgalarının hızı derinliğe bağlıdır: derinlik azaldıkça hız azalır.'],
      s: ['Kıyıda derinlik azalır → hız ve dalga boyu azalır, frekans değişmez.', 'Enerji daha dar bölgeye sıkışır → <em>genlik (yükseklik) artar</em> ✓'], n: ['Bu yüzden açık denizde fark edilmeyen tsunami kıyıda metrelerce yükselir.'] }),
    st({ mod: 'legen', dairesel: 1, lam1: 0.7, f: 0.6 }, { t: 'Dalga leğeninde noktasal kaynağın frekansı artırılırsa (derinlik aynı) ne değişir?', o: ['Dalga boyu azalır', 'Dalga hızı artar', 'Dalga boyu artar', 'Hiçbir şey değişmez'],
      b: [`${FM('v = λ · f')} · su dalgasının hızı yalnız derinliğe bağlıdır.`],
      s: ['Derinlik aynı → hız aynı.', `λ = ${F('v', 'f')} → f artınca <em>λ azalır</em> ✓ (tepeler sıklaşır)`] }),
    st({ mod: 'legen', lam1: 0.8, f: 0.6, etiket: 'stroboskop: 6 yarık' }, { t: 'Frekansı 24 Hz olan dalgalar, 6 yarıklı stroboskopla duruyormuş gibi görülüyor. Stroboskop saniyede en fazla kaç tur atıyordur?', o: ['4', '6', '24', '144'],
      b: [`Durgun görme şartı: ${FM('f<sub>dalga</sub> = n · N · f<sub>s</sub>')} (N: yarık sayısı, f<sub>s</sub>: dönme frekansı, n = 1, 2, 3…)`],
      s: ['En büyük f<sub>s</sub> için n = 1: 24 = 1 · 6 · f<sub>s</sub>', 'f<sub>s</sub> = <em>4 tur/s</em> ✓'], n: ['Daha yavaş dönüşlerde (2, 4/3 tur/s…) de durgun görülür; soruda en fazla isteniyor.'] }),
    st({ mod: 'ses', sesler: [[1, 1.5], [1, 3]], etiket: 'K ve L sesleri aynı genlikte' }, { t: 'Ekranda K ve L seslerinin dalgaları görülüyor. L\'nin frekansı K\'nin 2 katı, genlikleri eşit. Hangisi doğrudur?', o: ['L daha tiz (ince) duyulur', 'L daha şiddetli (yüksek) duyulur', 'L havada daha hızlı yayılır', 'İkisi de aynı duyulur'], f: ['dlA', 'dlB'],
      s: ['Sesin <em>yüksekliği</em> (incelik–kalınlık) frekansa bağlıdır: frekansı büyük olan L daha tiz ✓', 'Şiddet genliğe bağlıdır: genlikler eşit → şiddetler eşit.'], n: ['Aynı ortamda bütün seslerin hızı aynıdır (havada ≈ 340 m/s).', 'Tını: aynı notayı farklı çalgılarda ayırt etmemizi sağlayan özelliktir.'] }),
    st({ mod: 'ses', sesler: [[1, 2]] }, { t: 'Ses dalgası aşağıdaki ortamların hangisinde yayılamaz?', o: ['Boşluk', 'Su', 'Çelik', 'Hava'],
      b: ['Ses mekanik bir dalgadır: taneciklerin titreşimiyle iletilir.'],
      s: ['Boşlukta titreşecek tanecik yoktur → ses <em>yayılamaz</em> ✓', 'Ses hızı: katılarda > sıvılarda > gazlarda.'], n: ['Işık elektromanyetik dalgadır ve boşlukta yayılır; ses yayılamaz.'] }),
    st({ mod: 'ses', sesler: [[1, 2]], etiket: 'ses hızı 340 m/s' }, { t: 'Bir çocuk karşısındaki kayalığa bağırıyor ve sesinin yankısını 3 s sonra duyuyor. Kayalık kaç m uzaktadır? (v<sub>ses</sub> = 340 m/s)', o: ['510', '1020', '340', '170'],
      s: ['Ses kayalığa gidip geri döner: toplam yol = 2d.', `2d = v · t = 340 · 3 = 1020 m → d = <em>510 m</em> ✓`], n: ['Sık yanlış: 1020 m demek. Yankı süresi gidiş + dönüş süresidir.', 'Yarasaların ve sonarın (ekolokasyon) çalışma ilkesi budur.'] }),
    st({ mod: 'ses', sesler: [[1, 2]] }, { t: 'Gitar telinin titreşen boyu parmakla yarıya indirilirse (gerilme aynı) telden çıkan sesin frekansı ne olur?', o: ['2 katına çıkar', 'Yarıya iner', 'Değişmez', '4 katına çıkar'],
      b: [`Tel üzerinde temel titreşimde λ = 2L · ${FM('v = λ · f')} · teldeki dalga hızı gerilmeye ve tele bağlıdır.`],
      s: ['Tel aynı, gerilme aynı → dalga hızı aynı.', `${FM(`f = ${F('v', '2L')}`)} → L yarıya inince <em>f 2 katına çıkar</em> ✓ (ses incelir)`], n: ['Teli daha çok germek de frekansı artırır; kalın tel daha pes (kalın) ses verir.'] }),
    st({ mod: 'ses', sesler: [[1, 2]], etiket: 'deprem dalgaları' }, { t: 'Depremde önce gelen P dalgaları ile sonra gelen S dalgaları için hangisi doğrudur?', o: ['P boyuna, S enine dalgadır', 'P enine, S boyuna dalgadır', 'İkisi de enine dalgadır', 'İkisi de elektromanyetik dalgadır'],
      b: ['Boyuna dalgada tanecikler yayılma doğrultusunda, enine dalgada yayılma doğrultusuna dik titreşir.'],
      s: ['P (birincil) dalgaları sıkışma–genleşme ile ilerleyen <em>boyuna</em> dalgadır ve daha hızlıdır.', 'S (ikincil) dalgaları <em>enine</em> dalgadır, sıvılardan geçemez ✓'], n: ['Depremin büyüklüğü (Richter) açığa çıkan enerjiyi, şiddeti ise bir yerdeki hasarı anlatır.'] }),
  ] });

  // ======================= TUZAK SORULAR =======================
  const gT = gorev(sDl, { yk: 'TYT9-g4', no: 4, icon: '🪤', name: 'Tuzak sorular: dalgalar', tuzak: true, task: 'Sık yapılan hatalar: frekans–hız, genlik–hız, yankı, ses şiddeti.', steps: [
    { do: S => M(S, 'ip', { uc: 'sabit' }), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    st({ mod: 'ip', dizi: 2.5, v1: 3 }, { t: 'Aynı yayda elin titreşim frekansı 2 katına çıkarılırsa dalganın hızı ne olur?', o: ['Değişmez', '2 katına çıkar', 'Yarıya iner', '4 katına çıkar'],
      b: ['Dalganın hızını ortam belirler; frekansını kaynak belirler.'],
      s: ['Ortam (yay ve gerginliği) aynı → <em>hız değişmez</em> ✓; dalga boyu yarıya iner.'], n: ['TUZAK: v = λf\'ye bakıp "f 2 kat → v 2 kat" demek. f artınca λ azalır, çarpım sabit kalır.'] }),
    st({ mod: 'legen', lam1: 0.8, lam2: 0.4, sig: 1, f: 0.6 }, { t: 'Su dalgası derin bölgeden sığ bölgeye geçerken frekansı ne olur?', o: ['Değişmez', 'Azalır', 'Artar', 'Sıfır olur'], gizle: ['dlB'],
      b: ['Dalganın frekansı kaynağa bağlıdır.'],
      s: ['Kaynak aynı → <em>frekans değişmez</em> ✓; hız ve dalga boyu azalır.'], n: ['TUZAK: "her şey azalır" sanmak.'] }),
    st({ mod: 'ses', sesler: [[1.6, 2], [0.7, 2]] }, { t: 'Radyonun sesi açıldığında (frekans aynı) sesin hangi özelliği artar?', o: ['Şiddeti (genliği)', 'Yüksekliği (frekansı)', 'Hızı', 'Dalga boyu'], f: ['dlA', 'dlB'],
      b: ['Sesin şiddeti genliğe, yüksekliği (inceliği) frekansa bağlıdır.'],
      s: ['Ses açılınca hoparlör zarı daha büyük genlikle titreşir → <em>şiddet artar</em> ✓'], n: ['TUZAK: günlük dilde "sesi yükselt" denir ama fizikte "ses yüksekliği" frekanstır.'] }),
    st({ mod: 'ses', sesler: [[1, 2]] }, { b: ['Işık sesten yaklaşık bir milyon kat hızlıdır.', `Sabit hızla alınan yol: ${FM('x = v · t')}`], t: 'Gök gürültüsü şimşekten 4 s sonra duyuluyor. Şimşek yaklaşık kaç m uzakta çakmıştır? (v<sub>ses</sub> = 340 m/s, ışığın gecikmesi önemsiz)', o: ['1360', '680', '2720', '85'],
      s: ['Işık neredeyse anında gelir; gecikme sesin yolculuğudur.', 'd = 340 · 4 = <em>1360 m</em> ✓'], n: ['TUZAK: yankı sorusu gibi 2\'ye bölmek. Burada ses yalnız bir kez (gidiş) yol alır.'] }),
  ] });

  FZ.konuEk('TYT', 'Dalgalar', { gorevler: [gA, gB, gT] });
})();
