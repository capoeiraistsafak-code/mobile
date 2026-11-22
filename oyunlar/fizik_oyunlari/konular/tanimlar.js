// KİTAP DÜZENİ: Her konunun İLK dersinin başına (merak kartından hemen sonra) iki kart eklenir:
//   1) TANIM: Bu büyüklük/olay nedir? (temel formül, neden öyle)
//   2) KİM BULDU · BİRİM · ÖLÇME: tarihçe, SI birimi, hangi aletle ölçülür
// Sonra ders, sahnede görerek ve deneyerek devam eder. Yeni konu eklenirse buraya da tanımı eklenir.
(function () {
  const F = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
  const T = {
    'TYT|Fizik Bilimine Giriş': [
      ['Fizik nedir?', ['<em>Fizik</em>: madde ile enerjiyi ve aralarındaki etkileşimleri inceleyen, doğa olaylarını <em>deney ve ölçüm</em>le açıklayan temel bilimdir.', 'Alt dalları: mekanik, termodinamik, elektromanyetizma, optik, katıhal, atom, nükleer ve yüksek enerji fiziği.']],
      ['Kim · birim · ölçme', ['Bilimsel yöntemi deneyle kuran ilk büyük isimlerden biri <em>Galileo Galilei</em>dir (1600\'ler); İbn-i Heysem (965–1040) de optikte deneyi temel almıştır.', 'Ölçme: bir büyüklüğü aynı cinsten bir birimle karşılaştırmaktır. Uluslararası birim sistemi <em>SI</em> 1960\'ta kabul edildi; 7 temel birimi vardır (m, kg, s, A, K, mol, cd).']]],
    'TYT|Madde ve Özellikleri': [
      ['Madde ve özkütle', ['<em>Madde</em>: kütlesi ve hacmi olan, tanecikli yapıdaki her şeydir.', `<em>Özkütle (yoğunluk)</em>: birim hacimdeki kütle → ${FM(`d = ${F('m', 'V')}`)} · maddeyi tanıtan (ayırt edici) bir özelliktir.`]],
      ['Kim · birim · ölçme', ['Altın tacın sahte olup olmadığını taşırılan suyla ilk anlayan <em>Arşimet</em>tir (MÖ 3. yy).', 'Birim: kg/m³ (SI) ya da g/cm³ · 1 g/cm³ = 1000 kg/m³. Kütle eşit kollu terazi ile, hacim dereceli silindir veya taşırma kabıyla ölçülür.']]],
    'TYT|Hareket ve Kuvvet': [
      ['Hareket ve kuvvet nedir?', ['<em>Hareket</em>: bir cismin konumunun zamanla, bir gözlem noktasına göre değişmesidir.', `<em>Hız</em>: birim zamandaki yer değiştirme ${FM(`v = ${F('Δx', 'Δt')}`)} · <em>Kuvvet</em>: cismin hareket durumunu ya da şeklini değiştiren etki ${FM('F = m · a')}`]],
      ['Kim · birim · ölçme', ['Hareket yasalarını <em>Isaac Newton</em> 1687\'de <em>Principia</em> adlı kitabında yayımladı; eylemsizlik fikrini önce Galileo ortaya attı.', 'Birimler: hız m/s, ivme m/s², kuvvet <em>newton (N)</em> = kg · m/s². Kuvvet dinamometre ile ölçülür.']]],
    'TYT|Enerji': [
      ['İş ve enerji nedir?', [`<em>İş</em>: kuvvet uygulanan cisim kuvvet doğrultusunda yer değiştirirse yapılır: ${FM('W = F · x')}`, `<em>Enerji</em>: iş yapabilme yeteneğidir. ${FM(`E<sub>k</sub> = ${F('1', '2')} m v<sup>2</sup>`)} · ${FM('E<sub>p</sub> = m g h')} · <em>Güç</em>: birim zamanda yapılan iş ${FM(`P = ${F('W', 't')}`)}`]],
      ['Kim · birim · ölçme', ['Enerjinin korunumu 1840\'larda <em>James Joule</em>, <em>Julius Mayer</em> ve <em>Hermann von Helmholtz</em>\'un çalışmalarıyla kesinleşti. Joule, düşen ağırlığın suyu ısıttığını ölçtü.', 'Birimler: iş ve enerji <em>joule (J)</em> = N · m · güç <em>watt (W)</em> = J/s (James Watt\'ın adı). Elektrik sayacı enerjiyi kWh ile ölçer.']]],
    'TYT|Isı ve Sıcaklık': [
      ['Isı ve sıcaklık nedir?', ['<em>Sıcaklık</em>: maddeyi oluşturan taneciklerin ortalama hareket enerjisinin göstergesidir; termometreyle ölçülür.', `<em>Isı</em>: sıcaklık farkı nedeniyle sıcak cisimden soğuğa aktarılan enerjidir: ${FM('Q = m · c · ΔT')} (c: öz ısı)`]],
      ['Kim · birim · ölçme', ['Celsius ölçeğini <em>Anders Celsius</em> (1742), mutlak (Kelvin) ölçeğini <em>Lord Kelvin</em> (1848) önerdi. Galileo ilk termoskobu yaptı.', 'Birimler: sıcaklık °C ya da kelvin (K) · T(K) = t(°C) + 273 · ısı joule (J) ya da kalori (cal) · 1 cal ≈ 4,18 J. Isı kalorimetre kabıyla ölçülür.']]],
    'TYT|Elektrostatik': [
      ['Elektrik yükü nedir?', ['<em>Elektrik yükü</em>: maddenin, elektriksel kuvvet uygulamasını ve hissetmesini sağlayan temel özelliğidir. Proton (+), elektron (−) yüklüdür; yalnız elektronlar yer değiştirir.', `Aynı işaretli yükler iter, zıt işaretliler çeker. Kuvvet: ${FM(`F = k ${F('q<sub>1</sub> · q<sub>2</sub>', 'd<sup>2</sup>')}`)}`]],
      ['Kim · birim · ölçme', ['Sürtünmeyle yüklenmeyi ilk Thales (MÖ 600, kehribar) gözledi. Kuvvet yasasını <em>Charles-Augustin de Coulomb</em> 1785\'te burulma terazisiyle buldu.', 'Birim: <em>coulomb (C)</em> · bir elektronun yükü e = 1,6 · 10<sup>−19</sup> C. Yükün varlığı ve işareti <em>elektroskop</em>la anlaşılır.']]],
    'TYT|Elektrik ve Manyetizma': [
      ['Akım, gerilim, direnç', [`<em>Akım</em>: iletkenin kesitinden birim zamanda geçen yük miktarı ${FM(`I = ${F('q', 't')}`)} · <em>Gerilim (potansiyel farkı)</em>: yükleri harekete geçiren "itiş".`, `<em>Direnç</em>: iletkenin akıma karşı koyması · Ohm yasası ${FM('V = I · R')}`]],
      ['Kim · birim · ölçme', ['Pili <em>Alessandro Volta</em> (1800), direnç yasasını <em>Georg Ohm</em> (1827) buldu. Akımın pusulayı saptırdığını <em>Hans Christian Ørsted</em> (1820) gördü: elektrik ile manyetizma bağlıdır.', 'Birimler: akım amper (A), gerilim volt (V), direnç ohm (Ω). Akım <em>ampermetre</em> (seri), gerilim <em>voltmetre</em> (paralel) ile ölçülür.']]],
    'TYT|Basınç ve Kaldırma Kuvveti': [
      ['Basınç nedir?', [`<em>Basınç</em>: birim yüzeye dik olarak etki eden kuvvettir: ${FM(`P = ${F('F', 'A')}`)} · aynı kuvvet küçük alana uygulanırsa basınç büyür.`, `Sıvı basıncı derinlikle artar: ${FM('P = h · d · g')} · <em>Kaldırma kuvveti</em>: sıvının, içindeki cisme uyguladığı yukarı yönlü kuvvet ${FM('F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g')}`]],
      ['Kim · birim · ölçme', ['Basınç birimi adını <em>Blaise Pascal</em>\'dan alır (1600\'ler, Pascal ilkesi). Açık hava basıncını <em>Evangelista Torricelli</em> 1643\'te cıvalı boruyla ölçtü. Kaldırma kuvvetini <em>Arşimet</em> buldu.', 'Birim: <em>pascal (Pa)</em> = N/m² · 1 atm ≈ 101 300 Pa = 76 cmHg. Gaz basıncı manometre, açık hava basıncı barometre ile ölçülür.']]],
    'TYT|Dalgalar': [
      ['Dalga nedir?', ['<em>Dalga</em>: bir ortamda oluşan titreşimin (enerjinin) madde taşımadan yayılmasıdır.', `<em>Dalga boyu (λ)</em>: art arda iki tepe arası · <em>frekans (f)</em>: 1 saniyedeki titreşim sayısı · ${FM('v = λ · f')}`]],
      ['Kim · birim · ölçme', ['Dalgaların girişimini <em>Thomas Young</em> (1801) gösterdi; frekans birimi, elektromanyetik dalgaları üreten <em>Heinrich Hertz</em>\'in adını taşır.', 'Birimler: frekans hertz (Hz) = 1/s, dalga boyu m, hız m/s. Dalgalar leğende (dalga leğeni) ve yay/ip üzerinde incelenir.']]],
    'TYT|Optik': [
      ['Işık ve yansıma', ['<em>Işık</em>: gözümüzün algıladığı elektromanyetik dalgadır; boşlukta c = 3 · 10<sup>8</sup> m/s hızla düz çizgide yayılır.', '<em>Yansıma</em>: ışığın yüzeye çarpıp geri dönmesi · gelme açısı = yansıma açısı (normale göre). <em>Kırılma</em>: ortam değiştirirken yön değiştirmesi.']],
      ['Kim · birim · ölçme', ['Görmenin, cisimden göze gelen ışıkla olduğunu <em>İbn-i Heysem</em> (1021, <em>Kitâbü\'l-Menâzır</em>) deneylerle gösterdi. Kırılma yasası <em>Snell</em> (1621) adıyla bilinir.', 'Işık şiddeti birimi kandela (cd), aydınlanma lüks (lx), mercek gücü diyoptri (D). Açılar iletki ile ölçülür.']]],
    'AYT|Vektörler': [
      ['Vektör nedir?', ['<em>Skaler büyüklük</em>: yalnız sayı ve birimle anlatılır (kütle, zaman). <em>Vektörel büyüklük</em>: büyüklüğü yanında yönü de olan büyüklüktür (kuvvet, hız).', `Vektör okla gösterilir: ok boyu büyüklük, ok ucu yön. Dik iki vektörün bileşkesi ${FM('R<sup>2</sup> = A<sup>2</sup> + B<sup>2</sup>')}`]],
      ['Kim · birim · ölçme', ['Kuvvetlerin paralelkenar kuralıyla toplanmasını <em>Simon Stevin</em> (1586) kullandı; bugünkü vektör gösterimini <em>Gibbs</em> ve <em>Heaviside</em> (1880\'ler) geliştirdi.', 'Vektörün birimi, gösterdiği büyüklüğün birimidir (N, m/s…). Yön, açıyla (iletki) ya da birim vektörlerle (i, j) verilir.']]],
    'AYT|Bağıl Hareket': [
      ['Bağıl hız nedir?', ['<em>Bağıl hız</em>: bir cismin, hareket eden başka bir gözlemciye göre hızıdır. Hareket, kimin baktığına göre farklı görünür.', `${FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>')} · Akıntılı suda: yere göre hız = suya göre hız + akıntı hızı (vektörel)`]],
      ['Kim · birim · ölçme', ['"Bütün hareketler görelidir" fikrini <em>Galileo</em> gemi örneğiyle anlattı (1632); bugün bu dönüşüme Galileo dönüşümü denir.', 'Birim: m/s (km/h ÷ 3,6 = m/s). Hız takometre/hız göstergesi, radar ile ölçülür.']]],
    "AYT|Newton'un Hareket Yasaları": [
      ['Newton yasaları', ['1. yasa (eylemsizlik): net kuvvet sıfırsa cisim durumunu korur. 3. yasa: her etkiye eşit ve zıt bir tepki vardır.', `2. yasa: ${FM('F<sub>net</sub> = m · a')} · <em>Sürtünme kuvveti</em>: temas eden yüzeylerin kaymaya karşı koyması ${FM('f<sub>k</sub> = μ<sub>k</sub> · N')}`]],
      ['Kim · birim · ölçme', ['<em>Isaac Newton</em> üç yasayı 1687\'de yayımladı. Sürtünme yasalarını önce <em>Leonardo da Vinci</em>, sonra <em>Amontons</em> (1699) ve <em>Coulomb</em> buldu.', 'Kuvvet birimi <em>newton (N)</em>: 1 kg kütleye 1 m/s² ivme kazandıran kuvvet. Dinamometreyle ölçülür. μ birimsizdir.']]],
    'AYT|Bir Boyutta Sabit İvmeli Hareket': [
      ['İvme nedir?', [`<em>İvme</em>: hızın birim zamandaki değişimi ${FM(`a = ${F('Δv', 'Δt')}`)} · ivme sabitse hız düzgün değişir.`, `${FM('v = v<sub>0</sub> + a t')} · ${FM(`x = v<sub>0</sub> t + ${F('1', '2')} a t<sup>2</sup>`)} · ${FM('v<sup>2</sup> = v<sub>0</sub><sup>2</sup> + 2 a x')}`]],
      ['Kim · birim · ölçme', ['Düzgün hızlanan hareketi eğik düzlemde top yuvarlayarak <em>Galileo</em> inceledi (1600\'ler): alınan yol zamanın karesiyle artar.', 'Birim: m/s². Serbest düşmede g ≈ 9,8 ≈ 10 m/s². Hız-zaman grafiğinin eğimi ivmeyi, altındaki alan yer değiştirmeyi verir.']]],
    'AYT|İki Boyutta Hareket (Atışlar)': [
      ['Atış hareketi nedir?', ['<em>Atış</em>: yalnız yer çekimi etkisinde, ilk hızla fırlatılan cismin hareketidir. Yatay ve düşey hareketler birbirinden bağımsızdır.', `Yatayda ivme yok: ${FM('x = v<sub>x</sub> · t')} · düşeyde serbest düşme: ${FM(`h = ${F('1', '2')} g t<sup>2</sup>`)}`]],
      ['Kim · birim · ölçme', ['Merminin yolunun bir <em>parabol</em> olduğunu <em>Galileo</em> 1638\'de gösterdi.', 'Birimler: menzil ve yükseklik m, süre s. Hava direnci ihmal edilir.']]],
    'AYT|Enerji ve Hareket': [
      ['Mekanik enerji', [`<em>Mekanik enerji</em>: kinetik + potansiyel enerji ${FM('E = E<sub>k</sub> + E<sub>p</sub>')}. Sürtünme yoksa korunur.`, `Yayda depolanan enerji: ${FM(`E<sub>yay</sub> = ${F('1', '2')} k x<sup>2</sup>`)} · iş-enerji teoremi: ${FM('W<sub>net</sub> = ΔE<sub>k</sub>')}`]],
      ['Kim · birim · ölçme', ['Yay kuvvetinin uzamayla orantılı olduğunu <em>Robert Hooke</em> (1678) buldu: F = k x.', 'Birimler: enerji joule (J), yay sabiti k: N/m. Yay sabiti, yaya asılan ağırlık ve uzama ölçülerek bulunur.']]],
    'AYT|İtme ve Çizgisel Momentum': [
      ['Momentum ve itme', [`<em>Momentum</em>: kütle ile hızın çarpımı ${FM('p = m · v')} (vektörel). <em>İtme</em>: kuvvet ile etki süresinin çarpımı ${FM('I = F · Δt = Δp')}`, 'Dış kuvvet yoksa sistemin toplam momentumu korunur (çarpışmalar, patlamalar).']],
      ['Kim · birim · ölçme', ['"Hareket miktarı" fikrini <em>Descartes</em>, vektörel momentumun korunumunu <em>Huygens</em> ve <em>Wallis</em> (1660\'lar) çarpışma deneyleriyle buldu.', 'Birim: kg · m/s = N · s. Çarpışmalar hava rayı ve sensörlü arabalarla incelenir.']]],
    'AYT|Tork ve Denge': [
      ['Tork (moment) nedir?', [`<em>Tork</em>: kuvvetin döndürme etkisi ${FM('τ = F · d')} (d: kuvvetin dönme noktasına dik uzaklığı)`, 'Denge şartları: net kuvvet sıfır (ΣF = 0) ve net tork sıfır (Στ = 0).']],
      ['Kim · birim · ölçme', ['Kaldıraç yasasını <em>Arşimet</em> buldu: "Bana bir dayanak noktası verin, Dünya\'yı yerinden oynatayım."', 'Birim: N · m. Anahtar ve tork anahtarı vida sıkma torkunu ölçer.']]],
    'AYT|Kütle ve Ağırlık Merkezi': [
      ['Kütle merkezi nedir?', [`<em>Kütle merkezi</em>: cismin bütün kütlesi oradaymış gibi davrandığı nokta ${FM(`x<sub>KM</sub> = ${F('m<sub>1</sub>x<sub>1</sub> + m<sub>2</sub>x<sub>2</sub>', 'm<sub>1</sub> + m<sub>2</sub>')}`)}`, '<em>Ağırlık merkezi</em>: ağırlığın uygulandığı nokta; düzgün çekim alanında kütle merkeziyle aynıdır.']],
      ['Kim · birim · ölçme', ['Ağırlık merkezini ilk hesaplayan <em>Arşimet</em>tir (düzlemsel şekillerin dengesi).', 'Konum birimi m. Düzensiz bir levhanın ağırlık merkezi, iki farklı noktadan asılıp çekül çizgilerinin kesişimiyle bulunur.']]],
    'AYT|Basit Makineler': [
      ['Basit makine nedir?', ['<em>Basit makine</em>: kuvvetin yönünü ya da büyüklüğünü değiştirerek işi kolaylaştıran araçtır (kaldıraç, makara, eğik düzlem, çıkrık, vida, dişli).', `Kuvvetten kazanç yoldan kayıptır; iş kazancı yoktur. ${FM(`Verim = ${F('alınan iş', 'verilen iş')}`)}`]],
      ['Kim · birim · ölçme', ['Makaraları ve kaldıraçları sistemli inceleyen <em>Arşimet</em> ve İskenderiyeli <em>Heron</em>\'dur. <em>El-Cezerî</em> (1206) dişli ve kam düzenekleri tasarladı.', 'Kuvvet kazancı birimsizdir (yük / kuvvet). Kuvvetler dinamometreyle ölçülür.']]],
    'AYT|Elektriksel Kuvvet ve Alan': [
      ['Elektrik alan nedir?', [`<em>Elektrik alan</em>: yükün çevresinde, başka yüke kuvvet uygulanan bölge ${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)} · birim (+) yüke etki eden kuvvettir.`, `Kuvvet: ${FM('F = q · E')} · alan çizgileri (+) yükten çıkar, (−) yüke girer.`]],
      ['Kim · birim · ölçme', ['Alan çizgisi fikrini <em>Michael Faraday</em> (1830\'lar) ortaya attı; kuvvet yasası <em>Coulomb</em>\'undur (1785).', 'Birim: N/C = V/m · k = 9 · 10<sup>9</sup> N·m²/C².']]],
    'AYT|Elektriksel Potansiyel': [
      ['Potansiyel nedir?', [`<em>Elektriksel potansiyel</em>: birim yük başına düşen potansiyel enerji ${FM(`V = k ${F('q', 'd')}`)} (skaler)`, `İki nokta arasındaki potansiyel farkı, yükü taşımak için yapılan iştir: ${FM('W = q · ΔV')}`]],
      ['Kim · birim · ölçme', ['Birim adını pili bulan <em>Alessandro Volta</em>\'dan alır.', 'Birim: <em>volt (V)</em> = J/C. Potansiyel farkı voltmetreyle ölçülür. Elektron-volt: 1 eV = 1,6 · 10<sup>−19</sup> J.']]],
    'AYT|Düzgün Elektrik Alan ve Sığa': [
      ['Düzgün alan ve sığa', [`Paralel levhalar arasında alan her yerde aynıdır: ${FM(`E = ${F('V', 'd')}`)}`, `<em>Sığa</em>: kondansatörün yük depolama yeteneği ${FM(`C = ${F('q', 'V')}`)} · ${FM(`C = ε ${F('A', 'd')}`)}`]],
      ['Kim · birim · ölçme', ['İlk kondansatör <em>Leyden şişesi</em>dir (1745, von Kleist ve Musschenbroek). Birim <em>Faraday</em>\'ın adını taşır.', 'Birim: <em>farad (F)</em> = C/V · pratikte μF, nF, pF kullanılır. Sığa ölçer (kapasitemetre) ile ölçülür.']]],
    'AYT|Manyetizma ve İndüklenme': [
      ['Manyetik alan ve indüksiyon', ['<em>Manyetik alan</em>: mıknatısın ve akım taşıyan telin çevresinde, manyetik kuvvet hissedilen bölge. Alan çizgileri N\'den çıkıp S\'ye girer.', `<em>İndüksiyon</em>: manyetik akı değişince devrede akım oluşması ${FM(`ε = − ${F('ΔΦ', 'Δt')}`)} · ${FM('Φ = B · A')}`]],
      ['Kim · birim · ölçme', ['Akımın manyetik etkisini <em>Ørsted</em> (1820), indüksiyonu <em>Michael Faraday</em> (1831) buldu; yön kuralı <em>Lenz</em>\'indir (1834).', 'Birimler: manyetik alan <em>tesla (T)</em>, akı <em>weber (Wb)</em> = T · m². Alan pusula ve Hall sensörüyle (teslametre) ölçülür.']]],
    'AYT|Alternatif Akım ve Transformatörler': [
      ['Alternatif akım nedir?', ['<em>Alternatif akım (AC)</em>: yönü ve büyüklüğü düzenli olarak (sinüs gibi) değişen akımdır. Türkiye şebekesi 220 V, 50 Hz\'dir.', `<em>Transformatör</em>: AC gerilimi sarım sayısıyla orantılı değiştirir ${FM(`${F('V<sub>2</sub>', 'V<sub>1</sub>')} = ${F('N<sub>2</sub>', 'N<sub>1</sub>')}`)}`]],
      ['Kim · birim · ölçme', ['AC sistemini <em>Nikola Tesla</em> ve <em>George Westinghouse</em> (1880\'ler) yaygınlaştırdı; transformatörün ilkesi Faraday\'ın indüksiyonudur.', 'Birimler: volt, amper, frekans hertz (Hz). AC ölçen cihazlar etkin (efektif) değeri gösterir: V<sub>etkin</sub> = V<sub>max</sub> / √2.']]],
    'AYT|Çembersel Hareket': [
      ['Düzgün çembersel hareket', [`Çember üzerinde sabit süratle dönme. <em>Periyot (T)</em>: bir tur süresi · <em>frekans</em> f = 1/T · ${FM(`v = ${F('2πr', 'T')}`)} · ${FM(`ω = ${F('2π', 'T')}`)}`, `Hızın yönü sürekli değiştiği için merkeze doğru ivme vardır: ${FM(`a<sub>m</sub> = ${F('v<sup>2</sup>', 'r')}`)} · ${FM(`F<sub>m</sub> = m ${F('v<sup>2</sup>', 'r')}`)}`]],
      ['Kim · birim · ölçme', ['Merkezcil ivmenin formülünü <em>Christiaan Huygens</em> (1659) ve <em>Newton</em> buldu.', 'Birimler: periyot s, frekans Hz (devir/s), açısal hız rad/s, merkezcil kuvvet N. Devir sayısı takometreyle (devir/dakika) ölçülür.']]],
    'AYT|Dönme ve Açısal Momentum': [
      ['Açısal momentum', [`<em>Eylemsizlik momenti (I)</em>: cismin dönmeye karşı direnci, kütlenin eksene uzaklığına bağlı ${FM('I = Σ m r<sup>2</sup>')}`, `<em>Açısal momentum</em>: ${FM('L = I · ω')} · dış tork yoksa korunur (buz patencisi kollarını çekince hızlanır).`]],
      ['Kim · birim · ölçme', ['Dönen cisimlerin dinamiğini <em>Leonhard Euler</em> (1750\'ler) kurdu.', 'Birimler: I: kg · m², L: kg · m²/s, ω: rad/s. Dönme kinetik enerjisi: E = ½ I ω².']]],
    'AYT|Kütle Çekim ve Kepler Yasaları': [
      ['Kütle çekim nedir?', [`Kütleli her iki cisim birbirini çeker: ${FM(`F = G ${F('m<sub>1</sub> · m<sub>2</sub>', 'd<sup>2</sup>')}`)}`, 'Kepler yasaları: 1) Yörüngeler elipstir, Güneş bir odakta. 2) Eşit sürede eşit alan taranır. 3) T² / r³ sabittir.']],
      ['Kim · birim · ölçme', ['<em>Johannes Kepler</em> (1609–1619) Tycho Brahe\'nin gözlemlerinden yasalarını buldu; <em>Newton</em> (1687) bunları kütle çekimiyle açıkladı. G\'yi ilk <em>Cavendish</em> (1798) burulma terazisiyle ölçtü.', 'G = 6,67 · 10<sup>−11</sup> N · m²/kg². Gök cisimlerinin uzaklıkları astronomik birim (AU) ve ışık yılı ile verilir.']]],
    'AYT|Basit Harmonik Hareket': [
      ['Basit harmonik hareket', [`Denge konumuna uzaklıkla orantılı, geri çağırıcı kuvvetle yapılan titreşim: ${FM('F = − k x')}`, `Periyot: yay ${FM(`T = 2π √${F('m', 'k')}`)} · basit sarkaç ${FM(`T = 2π √${F('L', 'g')}`)}`]],
      ['Kim · birim · ölçme', ['Sarkacın periyodunun genliğe bağlı olmadığını <em>Galileo</em> gördü; sarkaçlı saati <em>Huygens</em> (1656) yaptı.', 'Birimler: periyot s, frekans Hz, genlik m. Periyot, 10 salınımın süresi kronometreyle ölçülüp 10\'a bölünerek bulunur.']]],
    'AYT|Dalga Mekaniği': [
      ['Girişim ve kırınım', ['<em>Girişim</em>: iki dalganın üst üste binmesi · tepe + tepe → kuvvetlenme (katar), tepe + çukur → sönme (düğüm).', `<em>Kırınım</em>: dalganın engel kenarından ya da yarıktan bükülerek yayılması · yol farkı ${FM('Δ = n · λ')} → katar çizgisi`]],
      ['Kim · birim · ölçme', ['Işığın dalga olduğunu <em>Thomas Young</em> çift yarık deneyiyle (1801) gösterdi; dalga ilkesini <em>Huygens</em> (1678) önerdi.', 'Birimler: dalga boyu m (ışıkta nm), frekans Hz. Su dalgaları dalga leğeninde stroboskopla incelenir.']]],
    'AYT|Atom Fiziğine Giriş ve Radyoaktivite': [
      ['Atom modeli ve radyoaktivite', ['Bohr modeli: elektron yalnız belirli enerji seviyelerinde bulunur; seviye değiştirirken seviye farkı kadar enerjili foton yayar ya da soğurur.', `<em>Radyoaktivite</em>: kararsız çekirdeğin kendiliğinden ışıma (α, β, γ) yaparak bozunması · <em>yarı ömür</em>: çekirdeklerin yarısının bozunma süresi ${FM(`N = N<sub>0</sub> (${F('1', '2')})<sup>t/T</sup>`)}`]],
      ['Kim · birim · ölçme', ['Çekirdeği <em>Rutherford</em> (1911), seviyeli modeli <em>Niels Bohr</em> (1913) buldu. Radyoaktiviteyi <em>Becquerel</em> (1896), <em>Marie</em> ve <em>Pierre Curie</em> incelediler.', 'Birimler: enerji eV, aktiflik becquerel (Bq) = bozunma/s. Radyasyon Geiger-Müller sayacıyla ölçülür.']]],
    'AYT|Modern Fizik': [
      ['Foton ve fotoelektrik', [`Işık, enerji paketleri (<em>foton</em>) hâlinde yayılır: ${FM('E = h · f')}`, `<em>Fotoelektrik olay</em>: yeterli enerjili foton metalden elektron koparır ${FM('E<sub>k</sub> = h f − W<sub>0</sub>')} (W<sub>0</sub>: eşik enerjisi)`]],
      ['Kim · birim · ölçme', ['Enerji paketlerini <em>Max Planck</em> (1900) önerdi; fotoelektrik olayı <em>Albert Einstein</em> (1905) açıkladı ve 1921 Nobel ödülünü aldı.', 'Planck sabiti h = 6,63 · 10<sup>−34</sup> J · s · enerji genelde eV ile verilir. Kopan elektronların enerjisi durdurma gerilimiyle ölçülür.']]],
    'AYT|Modern Fiziğin Uygulamaları': [
      ['Yarı iletken ve uygulamalar', ['<em>Yarı iletken</em>: iletkenliği iletkenle yalıtkan arasında olan, katkıyla ayarlanabilen madde (silisyum). LED, güneş pili, transistör böyle çalışır.', `LED\'in rengi yasak enerji aralığına bağlıdır: ${FM(`λ = ${F('h c', 'E<sub>g</sub>')}`)} · lazer, MR, PET, röntgen modern fiziğin uygulamalarıdır.`]],
      ['Kim · birim · ölçme', ['Transistörü <em>Bardeen</em>, <em>Brattain</em> ve <em>Shockley</em> (1947), lazeri <em>Theodore Maiman</em> (1960) yaptı; mavi LED 2014 Nobel ödülünü aldı.', 'Enerji aralığı eV, dalga boyu nm ile verilir: λ(nm) ≈ 1240 / E(eV).']]],
    'UNI|Young Çift Yarık Deneyi': [
      ['Çift yarık girişimi', [`İki yarıktan çıkan dalgalar perdede aydınlık–karanlık saçaklar oluşturur. Saçak aralığı ${FM(`Δy = ${F('λ L', 'd')}`)}`, 'Yol farkı d sin θ = m λ → aydınlık · (m + ½) λ → karanlık.']],
      ['Kim · birim · ölçme', ['<em>Thomas Young</em> 1801\'de ışığın dalga olduğunu gösterdi. 1961\'de <em>Claus Jönsson</em> aynı deneyi elektronlarla yaptı.', 'λ nm, d mm, L m, Δy mm mertebesindedir; saçaklar cetvel ve mikrometreyle ölçülür.']]],
    'UNI|Schrödinger Denklemi ve Kutudaki Parçacık': [
      ['Dalga fonksiyonu', ['<em>Dalga fonksiyonu ψ</em>: parçacığın kuantum durumunu anlatır; |ψ|² parçacığı bir yerde bulma olasılığıdır.', `Kutudaki parçacığın enerjisi kuantumludur: ${FM(`E<sub>n</sub> = ${F('n<sup>2</sup> h<sup>2</sup>', '8 m L<sup>2</sup>')}`)}`]],
      ['Kim · birim · ölçme', ['Denklemi <em>Erwin Schrödinger</em> (1926) yazdı; |ψ|²\'nin olasılık olduğunu <em>Max Born</em> önerdi.', 'Enerji J ya da eV; ψ\'nin kendisi ölçülemez, yalnız olasılık dağılımı çok sayıda ölçümle bulunur.']]],
    'UNI|Kuantum Tünelleme': [
      ['Tünelleme nedir?', ['<em>Tünelleme</em>: parçacığın, enerjisi engelden küçük olsa bile engelin öbür yanına geçebilmesidir; klasik fizikte imkânsızdır.', `Geçme olasılığı engel kalınlığıyla üstel azalır: ${FM('T ≈ e<sup>−2κL</sup>')}`]],
      ['Kim · birim · ölçme', ['Alfa bozunmasını tünellemeyle <em>George Gamow</em> (1928) açıkladı. Taramalı tünelleme mikroskobunu <em>Binnig</em> ve <em>Rohrer</em> (1981) yaptı.', 'Engel yüksekliği eV, kalınlık nm mertebesindedir; tünel akımı pA–nA ile ölçülür.']]],
    'UNI|Katıhal Fiziği: Kristal ve Bant Yapısı': [
      ['Kristal ve enerji bantları', ['<em>Kristal</em>: atomların düzenli, tekrar eden bir örgüyle dizildiği katıdır (birim hücre: SC, BCC, FCC).', 'Katıda atom seviyeleri <em>bantlara</em> dönüşür. Değerlik ile iletim bandı arasındaki <em>yasak enerji aralığı (E<sub>g</sub>)</em> iletken, yarı iletken ve yalıtkanı ayırır.']],
      ['Kim · birim · ölçme', ['Kristal yapıyı X-ışını kırınımıyla <em>von Laue</em> (1912) ve <em>Bragg</em>\'ler incelediler; bant kuramını <em>Felix Bloch</em> (1928) geliştirdi.', 'Örgü sabiti Å (10<sup>−10</sup> m), E<sub>g</sub> eV ile verilir. Kristal yapı X-ışını kırınımıyla ölçülür: 2 d sin θ = n λ.']]],
    'SEC|Yarı İletkenler ve p-n Eklemi': [
      ['p-n eklemi', ['<em>n tipi</em>: fazla elektronlu, <em>p tipi</em>: fazla boşluklu (deşikli) yarı iletken. Birleşince arada <em>tükenim bölgesi</em> oluşur.', 'İleri yönde akım geçer, ters yönde geçmez: <em>diyot</em> akımı tek yöne geçirir.']],
      ['Kim · birim · ölçme', ['p-n eklemini <em>Russell Ohl</em> (1940) buldu; transistör 1947\'de Bell laboratuvarlarında yapıldı.', 'Silisyum diyotta eşik gerilimi ≈ 0,7 V. Akım-gerilim eğrisi ampermetre ve voltmetreyle çıkarılır.']]],
    'SEC|Süperiletkenlik': [
      ['Süperiletkenlik nedir?', ['<em>Süperiletken</em>: kritik sıcaklığın altında direnci tam sıfır olan ve manyetik alanı içinden dışarı iten (Meissner olayı) maddedir.', 'Akım kayıpsız dolaşır; mıknatıs süperiletkenin üstünde havada durur.']],
      ['Kim · birim · ölçme', ['<em>Heike Kamerlingh Onnes</em> 1911\'de cıvanın 4,2 K\'de direncinin sıfırlandığını buldu. Meissner olayı 1933\'te bulundu.', 'Kritik sıcaklık kelvin (K) ile verilir; YBCO gibi seramikler 77 K\'in (sıvı azot) üstünde süperiletkendir.']]],
    'UNI|Özel Görelilik': [
      ['Özel görelilik', ['İki ilke: 1) Fizik yasaları bütün eylemsiz gözlemciler için aynıdır. 2) Işığın boşluktaki hızı herkes için c\'dir.', `Sonuçları: zaman genişlemesi ${FM('Δt = γ Δt<sub>0</sub>')}, boy kısalması, ${FM('E = m c<sup>2</sup>')}`]],
      ['Kim · birim · ölçme', ['<em>Albert Einstein</em> 1905\'te yayımladı; Michelson–Morley deneyi (1887) "esir"i bulamamıştı.', 'c = 3 · 10<sup>8</sup> m/s. Zaman genişlemesi, uçaklardaki atom saatleri ve atmosferdeki müonlarla ölçüldü.']]],
    'UNI|Dalga–Parçacık İkiliği': [
      ['Dalga–parçacık ikiliği', [`Işık parçacık (foton) gibi, madde de dalga gibi davranabilir. de Broglie dalga boyu: ${FM(`λ = ${F('h', 'p')}`)}`, 'Compton saçılması ışığın momentum taşıdığını gösterir.']],
      ['Kim · birim · ölçme', ['Madde dalgasını <em>Louis de Broglie</em> (1924) önerdi; <em>Davisson</em> ve <em>Germer</em> (1927) elektron kırınımıyla doğruladı. <em>Compton</em> 1923.', 'Dalga boyu m (pm, nm); momentum kg · m/s.']]],
    'UNI|Belirsizlik İlkesi': [
      ['Belirsizlik ilkesi', [`Konum ve momentum aynı anda istenen kesinlikle bilinemez: ${FM(`Δx · Δp ≥ ${F('ħ', '2')}`)}`, 'Bu ölçüm aletinin kusuru değil, doğanın (dalga yapısının) bir özelliğidir.']],
      ['Kim · birim · ölçme', ['<em>Werner Heisenberg</em> 1927\'de buldu.', 'ħ = h / 2π ≈ 1,05 · 10<sup>−34</sup> J · s. Δx m, Δp kg · m/s ile verilir.']]],
    'UNI|Hidrojen Atomu ve Spin': [
      ['Hidrojen atomu ve spin', [`Hidrojenin enerji seviyeleri: ${FM(`E<sub>n</sub> = − ${F('13,6 eV', 'n<sup>2</sup>')}`)}`, '<em>Spin</em>: elektronun kendine özgü açısal momentumu; ölçümde yalnız iki değer verir (+½, −½).']],
      ['Kim · birim · ölçme', ['Seviyeleri <em>Bohr</em> (1913), kuantum çözümünü <em>Schrödinger</em> (1926) buldu. Spini <em>Stern–Gerlach</em> deneyi (1922) gösterdi; <em>Uhlenbeck</em> ve <em>Goudsmit</em> (1925) açıkladı.', 'Enerji eV, spin ħ birimiyle verilir. Seviyeler spektroskopla (tayf çizgileri) ölçülür.']]],
    'UNI|Termodinamik ve Entropi': [
      ['Termodinamik yasaları', [`1. yasa: enerji korunur ${FM('ΔU = Q − W')} · 2. yasa: yalıtılmış sistemin entropisi kendiliğinden azalmaz.`, `<em>Entropi</em>: düzensizliğin (olası durum sayısının) ölçüsü ${FM('S = k<sub>B</sub> ln Ω')}`]],
      ['Kim · birim · ölçme', ['<em>Sadi Carnot</em> (1824) ısı makinelerini, <em>Rudolf Clausius</em> (1865) entropiyi, <em>Ludwig Boltzmann</em> (1877) S = k ln Ω\'yı buldu.', 'Entropi birimi J/K · k<sub>B</sub> = 1,38 · 10<sup>−23</sup> J/K.']]],
    'UNI|Maxwell Denklemleri ve EM Dalgalar': [
      ['Elektromanyetik dalga', ['Değişen elektrik alan manyetik alan, değişen manyetik alan elektrik alan oluşturur: bu ikili, boşlukta dalga olarak yayılır.', `E ve B birbirine ve yayılma yönüne diktir · ${FM(`c = ${F('1', '√(μ<sub>0</sub> ε<sub>0</sub>)')}`)} · ${FM('E = c · B')}`]],
      ['Kim · birim · ölçme', ['<em>James Clerk Maxwell</em> denklemleri 1865\'te yazdı; <em>Heinrich Hertz</em> 1887\'de radyo dalgalarını üretip ölçtü.', 'E: V/m, B: T, frekans Hz. Radyo, mikrodalga, ışık, X-ışını aynı ailedendir.']]],
    'SEC|Lazer Fiziği': [
      ['Lazer nedir?', ['<em>LASER</em>: uyarılmış ışıma ile ışığın güçlendirilmesi. Gelen foton, uyarılmış atomdan kendisinin aynısı (aynı faz, yön, renk) bir foton çıkarır.', 'Gerekenler: nüfus terslenmesi (pompalama) ve iki ayna arasında rezonatör.']],
      ['Kim · birim · ölçme', ['Uyarılmış ışımayı <em>Einstein</em> (1917) öngördü; ilk lazeri <em>Theodore Maiman</em> (1960) yakut kristaliyle yaptı.', 'Dalga boyu nm, güç W (mW). Lazer ışığı tek renkli ve çok az dağılır.']]],
    'SEC|Nükleer Fizik': [
      ['Çekirdek ve bağlanma enerjisi', ['Çekirdek proton ve nötronlardan oluşur; onları güçlü çekirdek kuvveti bir arada tutar.', `<em>Bağlanma enerjisi</em>: çekirdeği parçalamak için gereken enerji ${FM('E = Δm · c<sup>2</sup>')} · fisyon (bölünme) ve füzyon (birleşme) enerji açığa çıkarır.`]],
      ['Kim · birim · ölçme', ['Nötronu <em>Chadwick</em> (1932), fisyonu <em>Hahn</em>, <em>Strassmann</em> ve <em>Lise Meitner</em> (1938) buldu.', 'Enerji MeV, kütle atomik kütle birimi (u) ile verilir: 1 u ≈ 931,5 MeV/c².']]],
    'SEC|Parçacık Fiziği ve Standart Model': [
      ['Standart Model', ['Madde parçacıkları: 6 kuark (u, d, s, c, b, t) ve 6 lepton (elektron, müon, tau ve nötrinoları).', 'Kuvvet taşıyıcıları: foton (elektromanyetik), gluon (güçlü), W ve Z (zayıf); kütleyi Higgs alanı verir.']],
      ['Kim · birim · ölçme', ['Kuark modelini <em>Gell-Mann</em> ve <em>Zweig</em> (1964) önerdi; Higgs bozonu 2012\'de CERN\'de bulundu.', 'Kütleler GeV/c² ile verilir; parçacıklar hızlandırıcılarda (LHC) dedektörlerle ölçülür.']]],
    'SEC|Kuantum Hesaplama': [
      ['Kübit nedir?', ['<em>Kübit</em>: |0⟩ ve |1⟩ durumlarının üst üste binmesinde bulunabilen kuantum bit. Ölçülünce 0 ya da 1 verir.', `Ölçüm olasılıkları: ${FM('|α|<sup>2</sup> + |β|<sup>2</sup> = 1')} · kuantum kapıları (Hadamard, CNOT) durumu döndürür, dolanıklık oluşturur.`]],
      ['Kim · birim · ölçme', ['Kuantum bilgisayar fikrini <em>Richard Feynman</em> (1982) ve <em>David Deutsch</em> (1985) ortaya attı; <em>Shor</em> algoritması 1994.', 'Bilgi birimi kübit; durum Bloch küresi üzerinde bir okla gösterilir.']]],
    'SEC|Astrofizik ve Kozmoloji': [
      ['Genişleyen evren', [`Uzak gökadalar bizden, uzaklıklarıyla orantılı hızla uzaklaşır: ${FM('v = H<sub>0</sub> · d')}`, 'Evren yaklaşık 13,8 milyar yıl önce sıcak ve yoğun bir durumdan (Büyük Patlama) genişleyerek oluştu.']],
      ['Kim · birim · ölçme', ['Genişlemeyi <em>Edwin Hubble</em> (1929) ve <em>Georges Lemaître</em> buldu; kozmik mikrodalga arka ışımasını <em>Penzias</em> ve <em>Wilson</em> (1965) keşfetti.', 'Uzaklık ışık yılı ve parsek (pc), H<sub>0</sub> ≈ 70 km/s/Mpc. Hız, tayftaki kırmızıya kaymadan ölçülür.']]],
    'SEC|Genel Görelilik ve Kara Delikler': [
      ['Genel görelilik', ['Kütle ve enerji uzay-zamanı büker; kütle çekimi bu bükülmedir. Işık da bükülmüş uzay-zamanı izler.', `<em>Kara delik</em>: ışığın bile kaçamadığı bölge · olay ufku yarıçapı ${FM(`R<sub>s</sub> = ${F('2 G M', 'c<sup>2</sup>')}`)}`]],
      ['Kim · birim · ölçme', ['<em>Einstein</em> 1915\'te yayımladı; ışığın bükülmesini <em>Eddington</em> 1919 tutulmasında ölçtü. Kütle çekim dalgaları 2015\'te LIGO ile, kara delik görüntüsü 2019\'da EHT ile elde edildi.', 'Kara delik kütleleri Güneş kütlesi (M<sub>☉</sub>) cinsinden verilir.']]],
  };
  Object.entries(T).forEach(([ad, kartlar]) => {
    const h = FZ.HAZIR[ad]; if (!h || !h.dersler || !h.dersler.length) return;
    const M = h.dersler[0]; if (M._tanim) return; M._tanim = 1;
    const st = M.steps; let i = st.findIndex(s => s.k && s.k.tur === 'merak'); i = i < 0 ? 1 : i + 1;
    const ek = kartlar.map(([b, m], j) => ({ k: { tur: j ? 'tarih' : 'tanim', b, m } }));
    st.splice(Math.min(i, st.length), 0, ...ek);
  });
})();
