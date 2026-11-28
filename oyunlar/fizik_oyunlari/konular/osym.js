// ÖSYM TİPİ ÖNCÜLLÜ SORULAR (I, II, III yargıları + "Yalnız I", "I ve II" … 5 seçenek)
// Her TYT/AYT konusuna 2 soru. Yargılar doğru/yanlış işaretli verilir; yargıların sırası soruya göre döndürülür,
// doğru seçenek ve 4 çeldirici ÖSYM düzeninde otomatik kurulur. Sorular özgündür (kitaplardaki ÖSYM soru TİPİ örnek alınmıştır).
(function () {
  const { gorev } = FZ;
  const RN = ['I', 'II', 'III'];
  const ETK = ['Yalnız I', 'Yalnız II', 'Yalnız III', 'I ve II', 'I ve III', 'II ve III', 'I, II ve III'];
  const etiket = idx => idx.length === 1 ? 'Yalnız ' + RN[idx[0]] : idx.length === 2 ? RN[idx[0]] + ' ve ' + RN[idx[1]] : 'I, II ve III';
  // Bir öncüllü soru: kok (soru kökü), Y = [[yargı, doğru mu, neden], ×3], b (cevaptan önceki bilgi), son (soru sonu)
  let sayac = 0;
  const OQ = (kok, Y, b, son) => { const d = (sayac++) % 3, P = [0, 1, 2].map(i => Y[(i + d) % 3]);   // yargı sırasını döndür
    const dogru = P.map((y, i) => y[1] ? i : -1).filter(i => i >= 0), cev = etiket(dogru);
    const yakin = ETK.filter(e => e !== cev).sort((a, c) => Math.abs(ETK.indexOf(a) - ETK.indexOf(cev)) - Math.abs(ETK.indexOf(c) - ETK.indexOf(cev)));
    const o = [cev, ...yakin.slice(0, 4)];
    const t = `${kok}<br>${P.map((y, i) => `<span style="display:block;margin-left:14px">${RN[i]}. ${y[0]}</span>`).join('')}${son || 'yargılarından hangileri doğrudur?'}`;
    const s = P.map((y, i) => `${RN[i]}. ${y[1] ? '✓' : '✗'} ${y[2]}`).concat([`Doğru olanlar: <em>${cev}</em> ✓`]);
    return { q: { t, o, s, b, kartGizle: true, n: ['ÖSYM tipi: her yargıyı ayrı ayrı değerlendir; tek bir yanlış yargı o seçeneği eler.'] } }; };
  // taban: konunun 3D sahne grubu olan ilk görev/dersinin sahnesi (index.html'deki eski elle yazılmış görevlerin sahne grubu yoktur)
  const tabanBul = (sinav, ad) => { const h = FZ.HAZIR[sinav + '|' + ad]; if (!h) return null;
    for (const m of [...(h.gorevler || []), ...(h.dersler || [])]) { const p = Object.getPrototypeOf(m); if (p && p.group) return p; } return null; };
  const ekle = (sinav, ad, sorular) => { const taban = tabanBul(sinav, ad); if (!taban) return;
    const steps = [{ sub: 'ÖSYM tipi öncüllü sorular: yargıları tek tek değerlendirin.', go: '▶︎ Başla' }, ...sorular];
    FZ.konuEk(sinav, ad, { gorevler: [gorev(taban, { yk: (sinav + '-' + ad).replace(/\W+/g, '') + '-osym', no: 20, icon: '📝', name: 'ÖSYM tipi sorular', task: 'Öncüllü (I, II, III) ve "kesinlikle / olabilir" tipi, 5 seçenekli ÖSYM soruları.', steps, data: [] })] }); };

  // ============================== TYT ==============================
  ekle('TYT', 'Fizik Bilimine Giriş', [
    OQ('Aşağıdaki büyüklüklerle ilgili,', [['Kütle temel ve skaler bir büyüklüktür.', true, 'Kütle SI\'nın 7 temel büyüklüğünden biridir ve yönü yoktur.'], ['Sıcaklık temel ve skaler bir büyüklüktür.', true, 'Sıcaklık (K) temel büyüklüktür, yönü yoktur.'], ['Kuvvet temel ve vektörel bir büyüklüktür.', false, 'Kuvvet vektöreldir ama türetilmiştir (kg·m/s²).']],
      ['Temel büyüklükler: uzunluk, kütle, zaman, akım, sıcaklık, madde miktarı, ışık şiddeti.', 'Vektörel büyüklüklerin yönü vardır (kuvvet, hız, ivme…).']),
    OQ('Bilimsel bilgi ile ilgili,', [['Gözlem, deney ve akıl yürütmeye dayanır.', true, 'Bilimsel yöntemin temelidir.'], ['Kesin ve değişmezdir.', false, 'Yeni kanıtlarla değişebilir (ör. atom modelleri).'], ['Sınanabilir ve yanlışlanabilir.', true, 'Bilimsel bilginin ayırt edici özelliğidir.']],
      ['Bilimsel bilgi kanıta dayanır, sınanabilir ve yeni kanıtlarla güncellenebilir.']),
  ]);
  ekle('TYT', 'Madde ve Özellikleri', [
    OQ('Özkütle ile ilgili,', [['Saf maddeler için ayırt edici bir özelliktir.', true, 'Aynı koşullarda her saf maddenin özkütlesi farklıdır.'], ['Sıcaklık değişince değişebilir.', true, 'Isınan madde genleşir; hacim değişince d = m/V değişir.'], ['Madde miktarı artınca artar.', false, 'Kütle ve hacim birlikte artar; oran değişmez.']],
      [FM(`d = ${F('m', 'V')}`)]),
    OQ('Kütleleri eşit olan ve birbirine karışmayan K ve L sıvılarından K\'nin hacmi L\'ninkinden büyüktür. Buna göre,', [['L\'nin özkütlesi K\'ninkinden büyüktür.', true, 'Eşit kütlede hacmi küçük olanın özkütlesi büyüktür.'], ['Aynı kaba konurlarsa K üstte kalır.', true, 'Özkütlesi küçük olan sıvı üstte kalır.'], ['Karışımlarının özkütlesi K\'nin özkütlesinden küçük olur.', false, 'Karışımın özkütlesi iki sıvının özkütleleri arasındadır.']],
      [FM(`d = ${F('m', 'V')}`), 'Karışmayan sıvılarda özkütlesi büyük olan alta yerleşir.'], 'yargılarından hangileri kesinlikle doğrudur?'),
  ]);
  ekle('TYT', 'Hareket ve Kuvvet', [
    OQ('Sürtünmesiz yatay düzlemde durmakta olan bir cisme yatay ve sabit bir net kuvvet uygulanıyor. Buna göre,', [['Cisim düzgün hızlanan hareket yapar.', true, 'Sabit net kuvvet → sabit ivme.'], ['Cismin ivmesi sabittir.', true, FM('a = F / m') + ' sabit.'], ['Cismin hızı ile aldığı yol aynı oranda artar.', false, 'Hız t ile, yol t² ile artar.']],
      [FM('F<sub>net</sub> = m · a'), `${FM('v = a t')} · ${FM(`x = ${F('1', '2')} a t<sup>2</sup>`)}`]),
    OQ('Yatay masa üzerinde duran bir kitap için,', [['Kitabın ağırlığı ile masanın kitaba uyguladığı tepki kuvveti etki–tepki çiftidir.', false, 'İkisi de kitaba etki eder; etki–tepki çiftleri farklı cisimlere etki eder.'], ['Kitaba etki eden net kuvvet sıfırdır.', true, 'Kitap dengededir.'], ['Kitabın Dünya\'yı çektiği kuvvet, kitabın ağırlığına eşit büyüklüktedir.', true, 'Ağırlığın tepkisi budur (Newton\'un 3. yasası).']],
      ['Etki–tepki kuvvetleri eşit büyüklükte, zıt yönlü ve farklı cisimlere etki eder.']),
  ]);
  ekle('TYT', 'Enerji', [
    OQ('Sürtünmesiz bir rampanın tepesinden serbest bırakılan cisim aşağı inerken,', [['Kinetik enerjisi artar.', true, 'Hızı artar.'], ['Yere göre potansiyel enerjisi azalır.', true, 'Yüksekliği azalır.'], ['Mekanik enerjisi korunur.', true, 'Sürtünme olmadığı için E<sub>k</sub> + E<sub>p</sub> sabit.']],
      [`${FM(`E<sub>k</sub> = ${F('1', '2')} m v<sup>2</sup>`)} · ${FM('E<sub>p</sub> = m g h')}`]),
    OQ('Güç ile ilgili,', [['Birim zamanda yapılan iştir.', true, FM('P = W / t')], ['SI birimi jouledür.', false, 'Birimi watt (J/s); joule iş ve enerji birimidir.'], ['Aynı işi daha kısa sürede yapanın gücü daha büyüktür.', true, 'W sabitken t küçülürse P büyür.']],
      [FM(`P = ${F('W', 't')}`)]),
  ]);
  ekle('TYT', 'Isı ve Sıcaklık', [
    OQ('Isı ve sıcaklık ile ilgili,', [['Isı bir enerji türüdür; sıcaklık ise bir enerji değildir.', true, 'Sıcaklık, taneciklerin ortalama hareket enerjisinin göstergesidir.'], ['Sıcaklık termometre ile ölçülür.', true, 'Isı ise kalorimetre kabıyla dolaylı ölçülür.'], ['Isı alan bir maddenin sıcaklığı her zaman artar.', false, 'Hal değişimi sırasında sıcaklık sabit kalır.']],
      ['Isı: sıcaklık farkı nedeniyle aktarılan enerji · Sıcaklık: ortalama kinetik enerjinin göstergesi.']),
    OQ('Isıca yalıtılmış bir kapta sıcaklıkları farklı X ve Y suları karıştırılıyor ve ısıl denge sağlanıyor. Buna göre,', [['X\'in verdiği ısı Y\'nin aldığı ısıya eşittir.', true, 'Yalıtılmış kapta enerji korunur.'], ['Son sıcaklıkları eşittir.', true, 'Isıl dengenin tanımıdır.'], ['Sıcaklık değişimleri eşittir.', false, 'Kütleler farklıysa ΔT farklıdır (Q = m c ΔT).']],
      [FM('Q<sub>verilen</sub> = Q<sub>alınan</sub>'), FM('Q = m · c · ΔT')], 'yargılarından hangileri kesinlikle doğrudur?'),
  ]);
  ekle('TYT', 'Elektrostatik', [
    OQ('Nötr iletken küreye (+) yüklü çubuk dokunmadan yaklaştırılıyor. Çubuk yakındayken küre topraklanıp toprak bağlantısı kesiliyor, sonra çubuk uzaklaştırılıyor. Buna göre,', [['Küre (−) yükle yüklenir.', true, 'Etki ile yükleme: çubuğun işaretinin tersi.'], ['Topraklama sırasında topraktan küreye elektron geçer.', true, '(+) çubuk elektronları çeker; elektronlar topraktan gelir.'], ['Topraklama sırasında küreden toprağa proton geçer.', false, 'Protonlar çekirdekte; yalnız elektronlar hareket eder.']],
      ['Etki ile elektriklenmede yalnız elektronlar yer değiştirir; çubuk uzaklaştırılmadan toprak bağlantısı kesilmelidir.']),
    OQ('Özdeş iletken K (+4q) ve L (−2q) küreleri birbirine dokundurulup ayrılıyor. Buna göre,', [['Kürelerin toplam yükü korunur.', true, '+4q − 2q = +2q önce ve sonra.'], ['Her birinin son yükü +q olur.', true, 'Özdeş küreler toplamı eşit paylaşır.'], ['Dokunma sırasında K\'den L\'ye proton geçer.', false, 'L\'den K\'ye elektron geçer.']],
      ['Dokunan özdeş iletkenler toplam yükü eşit paylaşır; yük korunur.']),
  ]);
  ekle('TYT', 'Elektrik ve Manyetizma', [
    OQ('Bir üretece seri bağlı özdeş iki lambadan biri duyudan sökülüyor. Buna göre,', [['Diğer lamba söner.', true, 'Seri devrede tek yol vardır; devre açılır.'], ['Üreteçten akım çekilmez.', true, 'Devre açık.'], ['Sökülen lambanın duyunun uçları arasındaki gerilim sıfır olur.', false, 'Açık uçlar arasında üretecin gerilimi ölçülür.']],
      ['Seri devrede akım tek yoldan geçer; açık devrede akım sıfırdır.']),
    OQ('Çubuk mıknatıs ile ilgili,', [['İkiye kırılırsa her parçanın N ve S kutbu olur.', true, 'Tek kutuplu mıknatıs yoktur.'], ['Aynı kutuplar birbirini iter.', true, 'Zıt kutuplar çeker.'], ['Alan çizgileri mıknatısın dışında S\'den N\'ye yönelir.', false, 'Dışarıda N\'den S\'ye yönelir.']],
      ['Manyetik alan çizgileri mıknatısın dışında N kutbundan çıkıp S kutbuna girer.']),
  ]);
  ekle('TYT', 'Basınç ve Kaldırma Kuvveti', [
    OQ('Taban alanları farklı, biçimleri farklı kaplarda aynı sıvı aynı yüksekliğe kadar bulunuyor. Buna göre,', [['Kapların tabanlarındaki sıvı basınçları eşittir.', true, 'P = h d g; h ve d aynı.'], ['Kapların tabanlarına etki eden sıvı basınç kuvvetleri eşittir.', false, 'F = P · A; taban alanları farklı.'], ['Sıvı basıncı kabın biçimine bağlı değildir.', true, 'Yalnız derinliğe ve sıvının cinsine bağlıdır.']],
      [`${FM('P = h · d · g')} · ${FM('F = P · A')}`]),
    OQ('Suda yüzen tahta blok için,', [['Bloğa etki eden kaldırma kuvveti bloğun ağırlığına eşittir.', true, 'Yüzen cisimde F<sub>k</sub> = G.'], ['Blok tuzlu suya konursa batan hacmi azalır.', true, 'Sıvının özkütlesi artınca aynı F<sub>k</sub> için daha az hacim batar.'], ['Bloğun özkütlesi suyunkinden büyüktür.', false, 'Yüzen cismin özkütlesi sıvınınkinden küçüktür.']],
      [FM('F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g')]),
  ]);
  ekle('TYT', 'Dalgalar', [
    OQ('Gergin bir ipte ilerleyen dalga için,', [['Enerji taşır.', true, 'Dalga enerji taşır.'], ['İpin tanecikleri dalga ile birlikte ilerler.', false, 'Tanecikler yalnız yerinde titreşir; madde taşınmaz.'], ['İpin gerginliği artırılırsa dalganın hızı artar.', true, 'v = √(F/μ).']],
      [`Yaydaki dalga hızı: ${FM(`v = √${F('F', 'μ')}`)}`]),
    OQ('Ses dalgaları ile ilgili,', [['Boşlukta yayılamaz.', true, 'Mekanik dalgadır; ortam gerekir.'], ['Havada boyuna dalgadır.', true, 'Tanecikler yayılma doğrultusunda titreşir.'], ['Havada ışıktan daha hızlı yayılır.', false, 'Ses ≈ 340 m/s, ışık ≈ 3 · 10⁸ m/s.']],
      ['Mekanik dalgalar maddesel ortamda yayılır; ışık elektromanyetik dalgadır.']),
  ]);
  ekle('TYT', 'Optik', [
    OQ('Düzlem aynada gerçek bir cismin görüntüsü için,', [['Sanaldır.', true, 'Yansıyan ışınların uzantıları kesişir.'], ['Cisimle aynı boydadır.', true, 'Düzlem aynada büyütme 1.'], ['Aynaya uzaklığı, cismin aynaya uzaklığına eşittir.', true, 'Görüntü aynanın arkasında simetriktir.']],
      ['Gelme açısı = yansıma açısı; görüntü yansıyan ışınların uzantılarının kesiştiği yerdedir.']),
    OQ('Işık havadan suya eğik olarak geçerken,', [['Hızı azalır.', true, 'Su ışığı havadan daha çok yavaşlatır.'], ['Frekansı değişmez.', true, 'Frekansı kaynak belirler.'], ['Normalden uzaklaşarak kırılır.', false, 'Az kırıcıdan çok kırıcıya geçen ışık normale yaklaşır.']],
      [FM('n<sub>1</sub> sin i = n<sub>2</sub> sin r'), FM(`n = ${F('c', 'v')}`)]),
  ]);

  // ============================== AYT ==============================
  ekle('AYT', 'Vektörler', [
    OQ('Büyüklükleri 3 N ve 5 N olan iki kuvvetin bileşkesi,', [['2 N olabilir.', true, 'Zıt yönlüyse 5 − 3 = 2 N.'], ['8 N olabilir.', true, 'Aynı yönlüyse 3 + 5 = 8 N.'], ['9 N olabilir.', false, 'En büyük bileşke 8 N.']],
      [FM('|A − B| ≤ R ≤ A + B')], 'yargılarından hangileri doğru olabilir?'),
    OQ('Büyüklükleri eşit olan A ve B vektörleri için,', [['A + B ile A − B vektörleri birbirine diktir.', true, '(A + B) · (A − B) = A² − B² = 0.'], ['Aralarındaki açı 90° ise |A + B| = |A − B| olur.', true, 'İkisi de √2 A.'], ['|A + B| her zaman |A|\'dan büyüktür.', false, 'Açı 120° ise |A + B| = |A|; daha büyük açılarda küçüktür.']],
      [FM('R<sup>2</sup> = A<sup>2</sup> + B<sup>2</sup> + 2AB cos θ')], 'yargılarından hangileri kesinlikle doğrudur?'),
  ]);
  ekle('AYT', 'Bağıl Hareket', [
    OQ('Kayık suya göre sabit hızla ve burnu karşı kıyıya dik tutularak nehirde ilerliyor. Akıntı hızı artarsa,', [['Karşıya geçiş süresi değişmez.', true, 't = d / v<sub>dik</sub>.'], ['Kayığın yere göre hızının büyüklüğü artar.', true, '√(v<sub>k</sub>² + v<sub>a</sub>²) artar.'], ['Kayığın çıktığı nokta, karşısındaki noktadan akıntı yönünde daha uzak olur.', true, 'x = v<sub>a</sub> · t artar.']],
      ['Yere göre hız = suya göre hız + akıntı hızı (vektörel).', FM(`t = ${F('d', 'v<sub>dik</sub>')}`)]),
    OQ('Düz yolda aynı yönde K aracı 20 m/s, L aracı 15 m/s hızla gidiyor. Buna göre,', [['K\'deki gözlemci L\'yi 5 m/s ile geriye doğru gidiyor görür.', true, '15 − 20 = −5 m/s.'], ['L\'deki gözlemci K\'yi 5 m/s ile ileri gidiyor görür.', true, '20 − 15 = +5 m/s.'], ['Yerdeki gözlemci K\'yi 35 m/s ile gidiyor görür.', false, 'Yere göre K\'nin hızı 20 m/s.']],
      [FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>')]),
  ]);
  ekle('AYT', "Newton'un Hareket Yasaları", [
    OQ('Asansördeki baskülün üzerinde duran öğrencinin baskülde okuduğu değer, öğrencinin ağırlığından büyüktür. Buna göre asansör,', [['Yukarı doğru hızlanıyor olabilir.', true, 'İvme yukarı → N > mg.'], ['Aşağı doğru yavaşlıyor olabilir.', true, 'Aşağı giderken yavaşlama ivmesi yukarıdır → N > mg.'], ['Sabit hızla yukarı çıkıyor olabilir.', false, 'Sabit hızda N = mg.']],
      ['Baskül, öğrenciye uyguladığı tepki kuvvetini (N) gösterir.', FM('N − m g = m a') + ' (a yukarı pozitif)'], 'ifadelerinden hangileri doğru olabilir?'),
    OQ('Yatay düzlemde duran kutuya uygulanan yatay kuvvet yavaş yavaş artırılıyor ve bir süre sonra kutu kaymaya başlıyor. Buna göre,', [['Kutu kımıldamazken sürtünme kuvveti uygulanan kuvvete eşittir.', true, 'Statik sürtünme denge sağlar.'], ['Kayma başladığında sürtünme kuvveti genellikle azalır.', true, 'μ<sub>k</sub> < μ<sub>s</sub>.'], ['Kayarken sürtünme kuvveti kutunun hızı arttıkça artar.', false, 'Kinetik sürtünme μ<sub>k</sub> N; hıza bağlı değildir.']],
      [FM('f<sub>s,max</sub> = μ<sub>s</sub> N'), FM('f<sub>k</sub> = μ<sub>k</sub> N')]),
  ]);
  ekle('AYT', 'Bir Boyutta Sabit İvmeli Hareket', [
    OQ('Durgun hâlden düzgün hızlanan bir araç için,', [['Hızı zamanla doğru orantılı artar.', true, 'v = a t.'], ['Aldığı yol zamanın karesiyle orantılıdır.', true, 'x = ½ a t².'], ['Ardışık eşit zaman aralıklarında aldığı yollar eşittir.', false, 'Yollar 1 : 3 : 5 … oranında artar.']],
      [`${FM('v = v<sub>0</sub> + a t')} · ${FM(`x = v<sub>0</sub> t + ${F('1', '2')} a t<sup>2</sup>`)}`]),
    OQ('Hız–zaman grafiği, hızın pozitiften negatife düzgün olarak değiştiğini gösteren bir doğru olan cisim için,', [['İvmesi sabittir.', true, 'Doğrunun eğimi sabit.'], ['Hızın sıfır olduğu anda yön değiştirir.', true, 'Hızın işareti değişir.'], ['Hızın sıfır olduğu anda ivmesi sıfırdır.', false, 'İvme (eğim) her an aynıdır; sıfır değildir.']],
      ['Hız–zaman grafiğinin eğimi ivmeyi, altındaki alan yer değiştirmeyi verir.']),
  ]);
  ekle('AYT', 'İki Boyutta Hareket (Atışlar)', [
    OQ('Yerden eğik olarak atılan cisim için (hava direnci yok),', [['Hızının yatay bileşeni sabittir.', true, 'Yatayda kuvvet yok.'], ['Tepe noktasında hızı sıfırdır.', false, 'Tepede yalnız düşey bileşen sıfır; yatay bileşen vardır.'], ['Uçuş boyunca ivmesi sabittir.', true, 'İvme her an g, aşağı.']],
      ['Yatay ve düşey hareketler birbirinden bağımsızdır; tek kuvvet ağırlıktır.']),
    OQ('Aynı yükseklikten bir cisim yatay atılırken, özdeş başka bir cisim aynı anda serbest bırakılıyor. Buna göre,', [['Yere aynı anda düşerler.', true, 'Düşey ilk hızları ikisinde de sıfır.'], ['Yere çarpma hızlarının büyüklükleri eşittir.', false, 'Yatay atılanın ek yatay hızı vardır.'], ['Düşey hız bileşenleri her an eşittir.', true, 'v<sub>y</sub> = g t ikisinde de.']],
      [FM(`h = ${F('1', '2')} g t<sup>2</sup>`)]),
  ]);
  ekle('AYT', 'Enerji ve Hareket', [
    OQ('Yay sabiti k olan yay x kadar sıkıştırılıp önündeki cisim sürtünmesiz yatay düzlemde serbest bırakılıyor. Buna göre,', [[`Yayda depolanan enerji ${F('1', '2')} k x<sup>2</sup> kadardır.`, true, 'Esneklik potansiyel enerjisi.'], ['x iki katına çıkarılırsa cismin yaydan ayrılma hızı 2 katına çıkar.', true, 'v = x √(k/m) → v ∝ x.'], ['Cismin kütlesi artırılırsa yaydan ayrılma hızı azalır.', true, 'v ∝ 1/√m.']],
      [FM(`${F('1', '2')} k x<sup>2</sup> = ${F('1', '2')} m v<sup>2</sup>`)]),
    OQ('Sabit hızla yükselen bir asansördeki yolcu için,', [['Yolcuya etki eden net kuvvetin yaptığı iş sıfırdır.', true, 'Hız sabit → ΔE<sub>k</sub> = 0.'], ['Yolcunun mekanik enerjisi korunur.', false, 'Potansiyel enerji artar, kinetik değişmez → mekanik enerji artar.'], ['Yolcunun yere göre potansiyel enerjisi artar.', true, 'Yüksekliği artar.']],
      [FM('W<sub>net</sub> = ΔE<sub>k</sub>'), FM('E<sub>p</sub> = m g h')]),
  ]);
  ekle('AYT', 'İtme ve Çizgisel Momentum', [
    OQ('Sürtünmesiz yatay düzlemde çarpışıp yapışan iki araba için,', [['Toplam momentum korunur.', true, 'Dış kuvvet yok.'], ['Toplam kinetik enerji korunur.', false, 'Yapışık çarpışmada kinetik enerjinin bir kısmı ısıya dönüşür.'], ['Arabaların birbirine uyguladığı kuvvetler eşit büyüklüktedir.', true, 'Etki–tepki.']],
      [FM('m<sub>1</sub>v<sub>1</sub> + m<sub>2</sub>v<sub>2</sub> = (m<sub>1</sub> + m<sub>2</sub>) v')]),
    OQ('Momentum ile ilgili,', [['Vektörel bir büyüklüktür.', true, 'p = m v; hızın yönündedir.'], ['Momentum değişimi itmeye eşittir.', true, 'F · Δt = Δp.'], ['Hızının büyüklüğü sabit kalan cismin momentumu değişmez.', false, 'Yön değişirse momentum değişir (ör. duvardan geri dönen top).']],
      [FM('p = m · v'), FM('I = F · Δt = Δp')]),
  ]);
  ekle('AYT', 'Tork ve Denge', [
    OQ('Ağırlığı önemsiz bir çubuk, üzerine asılı düşey ağırlıklarla ve tek bir destek üzerinde dengededir. Buna göre,', [['Çubuğa etki eden net kuvvet sıfırdır.', true, 'Denge şartı ΣF = 0.'], ['Herhangi bir noktaya göre net tork sıfırdır.', true, 'Denge şartı Στ = 0.'], ['Desteğin tepki kuvveti asılı ağırlıkların toplamına eşittir.', true, 'ΣF = 0 → N = ΣG.']],
      [`${FM('Σ F = 0')} · ${FM('Σ τ = 0')}`]),
    OQ('Bir kuvvetin bir noktaya göre torku ile ilgili,', [['Kuvvetin büyüklüğüne bağlıdır.', true, 'τ = F · d.'], ['Kuvvetin doğrultusunun o noktaya dik uzaklığına bağlıdır.', true, 'Kuvvet kolu.'], ['Kuvvet o noktadan geçerse tork en büyük olur.', false, 'Dik uzaklık sıfır → tork sıfır.']],
      [FM('τ = F · d') + ' (d: dik uzaklık)']),
  ]);
  ekle('AYT', 'Kütle ve Ağırlık Merkezi', [
    OQ('Türdeş ve simetrik cisimler için,', [['Kütle merkezi simetri merkezindedir.', true, 'Kütle simetrik dağılmıştır.'], ['Kütle merkezi her zaman cismin üzerindedir.', false, 'Halka gibi cisimlerde boşluktadır.'], ['Düzgün çekim alanında ağırlık merkezi ile kütle merkezi aynı noktadır.', true, 'g her yerde aynıysa çakışır.']],
      [FM(`x<sub>KM</sub> = ${F('Σ m x', 'Σ m')}`)]),
    OQ('Ağırlığı önemsiz çubuğun bir ucuna m, diğer ucuna 3m kütleli cisimler asılıyor. Buna göre,', [['Sistemin kütle merkezi 3m kütleli cisme daha yakındır.', true, 'Kütle merkezi ağır tarafa yakındır.'], ['Kütle merkezi çubuğun tam ortasındadır.', false, 'Kütleler eşit değil.'], ['Çubuk kütle merkezinden asılırsa dengede kalır.', true, 'Ağırlıkların torkları dengelenir.']],
      [FM(`x<sub>KM</sub> = ${F('m<sub>1</sub>x<sub>1</sub> + m<sub>2</sub>x<sub>2</sub>', 'm<sub>1</sub> + m<sub>2</sub>')}`)]),
  ]);
  ekle('AYT', 'Basit Makineler', [
    OQ('Sürtünmesiz ve ağırlıksız basit makineler için,', [['Kuvvetten kazanç sağlanırsa yoldan kayıp olur.', true, 'İş korunur: F · x = G · h.'], ['İşten kazanç sağlanabilir.', false, 'Hiçbir basit makine işten kazanç sağlamaz.'], ['Hareketli makarada kuvvet kazancı 2\'dir.', true, 'Yükü iki ip parçası taşır.']],
      ['Kuvvet kazancı = yük / kuvvet · iş = kuvvet × yol']),
    OQ('Sürtünmesiz eğik düzlemde bir yük sabit hızla belirli bir yüksekliğe çıkarılıyor. Eğim açısı küçültülürse (yükseklik aynı),', [['Gereken kuvvet azalır.', true, 'F = G sin θ.'], ['Kuvvetin uygulandığı yol uzar.', true, 'Düzlemin boyu uzar.'], ['Yapılan iş azalır.', false, 'İş = G · h; değişmez.']],
      [FM('F = G · sin θ'), FM('F · ℓ = G · h')]),
  ]);
  ekle('AYT', 'Elektriksel Kuvvet ve Alan', [
    OQ('Noktasal +q yükünün çevresindeki elektrik alan için,', [['Alan çizgileri yükten dışarı doğrudur.', true, '(+) yükten çıkar.'], ['Yükten uzaklaştıkça alan şiddeti azalır.', true, 'E ∝ 1/d².'], ['Alana bırakılan elektron alan yönünde hızlanır.', false, 'Elektronun kuvveti alana zıttır.']],
      [FM(`E = k ${F('q', 'd<sup>2</sup>')}`), FM('F = q E')]),
    OQ('Aralarında d uzaklığı bulunan q<sub>1</sub> ve q<sub>2</sub> noktasal yükleri için,', [['Uzaklık 2 katına çıkarsa aralarındaki kuvvet dörtte birine iner.', true, 'F ∝ 1/d².'], ['Birbirlerine uyguladıkları kuvvetler eşit büyüklüktedir.', true, 'Etki–tepki.'], ['Büyük yük küçük yüke daha büyük kuvvet uygular.', false, 'Kuvvetler eşit büyüklüktedir.']],
      [FM(`F = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd<sup>2</sup>')}`)]),
  ]);
  ekle('AYT', 'Elektriksel Potansiyel', [
    OQ('Elektriksel potansiyel ile ilgili,', [['Skaler bir büyüklüktür.', true, 'Yönü yoktur; işaretiyle toplanır.'], ['SI birimi volttur.', true, 'V = J/C.'], ['Eş potansiyel yüzey üzerinde yük taşınırken iş yapılır.', false, 'ΔV = 0 → W = 0.']],
      [FM(`V = k ${F('q', 'd')}`), FM('W = q · ΔV')]),
    OQ('+Q noktasal yükünden uzaklaştıkça,', [['Elektriksel potansiyel azalır.', true, 'V ∝ 1/d.'], ['Elektrik alan şiddeti potansiyelden daha hızlı azalır.', true, 'E ∝ 1/d², V ∝ 1/d.'], ['Potansiyel negatif değerler alır.', false, '+Q\'nun potansiyeli her yerde pozitiftir.']],
      [`${FM(`V = k ${F('Q', 'd')}`)} · ${FM(`E = k ${F('Q', 'd<sup>2</sup>')}`)}`]),
  ]);
  ekle('AYT', 'Düzgün Elektrik Alan ve Sığa', [
    OQ('Üretece bağlı paralel levhalı kondansatörün levhaları arasındaki uzaklık artırılırsa,', [['Sığası azalır.', true, 'C = ε A / d.'], ['Levhalar arasındaki gerilim değişmez.', true, 'Üretece bağlı.'], ['Levhalardaki yük artar.', false, 'q = C V; C azalınca q azalır.']],
      [FM(`C = ε ${F('A', 'd')}`), FM('q = C · V')]),
    OQ('Yüklü paralel levhalar arasındaki düzgün elektrik alanda,', [['Alan her noktada aynı büyüklük ve yöndedir.', true, 'Düzgün alanın tanımı.'], ['Levhalar arasına bırakılan yüklü parçacık sabit ivmeyle hareket eder.', true, 'F = q E sabit.'], ['Alan çizgileri (−) levhadan (+) levhaya doğrudur.', false, '(+) levhadan (−) levhaya doğrudur.']],
      [FM(`E = ${F('V', 'd')}`), FM('F = q · E')]),
  ]);
  ekle('AYT', 'Manyetizma ve İndüklenme', [
    OQ('Düzgün manyetik alana dik olarak giren yüklü parçacık için,', [['Hızının büyüklüğü değişmez.', true, 'Manyetik kuvvet hıza dik; iş yapmaz.'], ['Düzgün çembersel hareket yapar.', true, 'Merkezcil kuvveti qvB sağlar.'], ['Kinetik enerjisi artar.', false, 'İş yapılmadığından değişmez.']],
      [FM('F = q v B'), FM(`r = ${F('m v', 'q B')}`)]),
    OQ('Kapalı bir iletken halkadan geçen manyetik akı değişiyor. Buna göre,', [['Halkada indüksiyon emk\'sı oluşur.', true, 'Faraday yasası.'], ['İndüksiyon akımı, akı değişimine karşı koyacak yöndedir.', true, 'Lenz kuralı.'], ['Akı ne kadar yavaş değişirse emk o kadar büyük olur.', false, 'ε = ΔΦ/Δt; hızlı değişim büyük emk.']],
      [FM(`ε = − ${F('ΔΦ', 'Δt')}`)]),
  ]);
  ekle('AYT', 'Alternatif Akım ve Transformatörler', [
    OQ('Alternatif akım devresinde kaynağın frekansı artırılırsa,', [['Bobinin indüktif reaktansı artar.', true, 'X<sub>L</sub> = 2π f L.'], ['Kondansatörün kapasitif reaktansı azalır.', true, 'X<sub>C</sub> = 1 / (2π f C).'], ['Direncin değeri artar.', false, 'Direnç frekansa bağlı değildir.']],
      [`${FM('X<sub>L</sub> = 2π f L')} · ${FM(`X<sub>C</sub> = ${F('1', '2π f C')}`)}`]),
    OQ('İdeal transformatör için,', [['Yalnız alternatif akımla çalışır.', true, 'DC\'de akı değişmez.'], ['Primer ve sekonder devrelerinin güçleri eşittir.', true, 'İdeal: kayıp yok.'], ['Sekonder sarım sayısı primerinkinden büyükse çıkış gerilimi azalır.', false, 'Yükseltici olur; gerilim artar.']],
      [FM(`${F('V<sub>s</sub>', 'V<sub>p</sub>')} = ${F('N<sub>s</sub>', 'N<sub>p</sub>')}`), FM('V<sub>p</sub> I<sub>p</sub> = V<sub>s</sub> I<sub>s</sub>')]),
  ]);
  ekle('AYT', 'Çembersel Hareket', [
    OQ('Düzgün çembersel hareket yapan bir cisim için,', [['Sürati sabittir.', true, 'Hızın büyüklüğü değişmez.'], ['İvmesi her an merkeze doğrudur.', true, 'Merkezcil ivme.'], ['Hız vektörü sabittir.', false, 'Hızın yönü sürekli değişir.']],
      [FM(`a<sub>m</sub> = ${F('v<sup>2</sup>', 'r')}`)]),
    OQ('Yatay düz yolda virajı sabit süratle dönen bir otomobil için,', [['Gereken merkezcil kuvveti yol ile tekerlekler arasındaki sürtünme sağlar.', true, 'Yatay yolda tek yatay kuvvet sürtünmedir.'], ['Sürat artarsa gereken merkezcil kuvvet artar.', true, 'F ∝ v².'], ['Viraj yarıçapı küçülürse gereken merkezcil kuvvet azalır.', false, 'F ∝ 1/r; artar.']],
      [FM(`F<sub>m</sub> = m ${F('v<sup>2</sup>', 'r')}`)]),
  ]);
  ekle('AYT', 'Dönme ve Açısal Momentum', [
    OQ('Dış torkun etki etmediği dönen bir sistem için,', [['Açısal momentum korunur.', true, 'Στ = 0.'], ['Eylemsizlik momenti azalırsa açısal hızı artar.', true, 'I ω sabit.'], ['Dönme kinetik enerjisi her durumda korunur.', false, 'Kollar kapanınca E<sub>k</sub> artar (kas işi).']],
      [FM('L = I · ω'), FM(`E<sub>k</sub> = ${F('1', '2')} I ω<sup>2</sup>`)]),
    OQ('Eylemsizlik momenti ile ilgili,', [['Kütlenin dönme eksenine göre dağılımına bağlıdır.', true, 'I = Σ m r².'], ['SI birimi kg·m²\'dir.', true, 'Kütle × uzaklık².'], ['Cismin dönme hızına bağlıdır.', false, 'Hıza bağlı değildir.']],
      [FM('I = Σ m r<sup>2</sup>')]),
  ]);
  ekle('AYT', 'Kütle Çekim ve Kepler Yasaları', [
    OQ('Kepler yasalarına göre,', [['Gezegenlerin yörüngeleri elipstir.', true, '1. yasa.'], ['Gezegen Güneş\'e yakınken daha hızlıdır.', true, '2. yasa (eşit alanlar).'], ['Gezegenin yörünge periyodu kendi kütlesi arttıkça artar.', false, 'T²/a³ sabit; gezegenin kütlesine bağlı değil.']],
      [FM(`${F('T<sup>2</sup>', 'a<sup>3</sup>')} = sabit`)]),
    OQ('Yeryüzünden yükseldikçe bir cismin,', [['Bulunduğu yerdeki çekim ivmesi azalır.', true, 'g ∝ 1/r².'], ['Kütlesi azalır.', false, 'Kütle değişmez.'], ['Ağırlığı azalır.', true, 'G = m g.']],
      [FM(`g = G ${F('M', 'r<sup>2</sup>')}`)]),
  ]);
  ekle('AYT', 'Basit Harmonik Hareket', [
    OQ('Sürtünmesiz yatay düzlemde basit harmonik hareket yapan yay–kütle sistemi için,', [['Periyot genliğe bağlı değildir.', true, 'T = 2π √(m/k).'], ['Denge konumunda hız en büyüktür.', true, 'Potansiyel enerji en küçük.'], ['Uç noktalarda ivme sıfırdır.', false, 'Uçlarda |a| en büyük.']],
      [FM(`T = 2π √${F('m', 'k')}`), FM('a = − ω<sup>2</sup> x')]),
    OQ('Küçük açılarla salınan basit sarkaç için,', [['İp uzunluğu artırılırsa periyot artar.', true, 'T ∝ √L.'], ['Periyot sarkacın kütlesine bağlı değildir.', true, 'Formülde kütle yok.'], ['Sarkaç Ay\'a götürülürse periyodu kısalır.', false, 'g küçük → T uzar.']],
      [FM(`T = 2π √${F('L', 'g')}`)]),
  ]);
  ekle('AYT', 'Dalga Mekaniği', [
    OQ('Su dalgalarında kırınım ile ilgili,', [['Yarık genişliği dalga boyundan küçük ya da ona eşitse belirgin kırınım olur.', true, 'λ ≥ w şartı.'], ['Kırınıma uğrayan dalganın frekansı değişmez.', true, 'Frekansı kaynak belirler.'], ['Kırınım yalnız ışık dalgalarında görülür.', false, 'Bütün dalgalarda görülür.']],
      ['Kırınım: dalganın engel kenarından ya da yarıktan bükülerek yayılması.']),
    OQ('Young çift yarık deneyinde,', [['Saçak aralığı ışığın dalga boyu artınca artar.', true, 'Δx ∝ λ.'], ['Yarıklar arası uzaklık artırılırsa saçak aralığı azalır.', true, 'Δx ∝ 1/d.'], ['Merkezî aydınlık saçağın yeri ışığın rengine bağlıdır.', false, 'Merkezî aydınlık yarıkların tam karşısındadır.']],
      [FM(`Δx = ${F('L λ', 'd')}`)]),
  ]);
  ekle('AYT', 'Atom Fiziğine Giriş ve Radyoaktivite', [
    OQ('Bohr atom modeline göre,', [['Elektron kararlı yörüngelerde dolanırken ışıma yapmaz.', true, '1. varsayım.'], ['Elektron üst enerji seviyesinden alta inerken foton yayar.', true, 'E<sub>foton</sub> = E<sub>üst</sub> − E<sub>alt</sub>.'], ['Çok elektronlu atomların spektrumlarını açıklar.', false, 'Yalnız tek elektronlu atomlarda başarılıdır.']],
      ['Bohr modeli hidrojen gibi tek elektronlu atomlar için geliştirilmiştir.']),
    OQ('Radyoaktif ışımalar ile ilgili,', [['γ ışımasında çekirdeğin atom ve kütle numarası değişmez.', true, 'Yalnız enerji yayılır.'], ['α ışıması yapan çekirdeğin kütle numarası 4 azalır.', true, 'He çekirdeği çıkar.'], ['β⁻ ışıması yapan çekirdeğin atom numarası azalır.', false, 'Nötron protona dönüşür; Z 1 artar.']],
      ['α: A − 4, Z − 2 · β⁻: Z + 1 · β⁺: Z − 1 · γ: değişmez']),
  ]);
  ekle('AYT', 'Modern Fizik', [
    OQ('Fotoelektrik olay ile ilgili,', [['Işığın frekansı eşik frekansından küçükse şiddeti ne olursa olsun elektron sökülmez.', true, 'Her foton enerjisini tek elektrona verir.'], ['Sökülen elektronların en büyük kinetik enerjisi ışığın şiddetine bağlıdır.', false, 'Frekansa bağlıdır; şiddet elektron sayısını belirler.'], ['Işığın tanecik modelini destekler.', true, 'Foton kavramıyla açıklanır.']],
      [FM('E = E<sub>0</sub> + E<sub>k</sub>'), FM('E = h f')]),
    OQ('Siyah cisim ışımasında cismin sıcaklığı artarsa,', [['Toplam ışıma gücü artar.', true, 'Eğrinin altındaki alan büyür.'], ['En şiddetli ışımanın dalga boyu kısalır.', true, 'Wien: λ<sub>max</sub> T = sabit.'], ['Cisim yalnız tek bir dalga boyunda ışıma yapar.', false, 'Her dalga boyunda ışıma yapar.']],
      [FM('λ<sub>max</sub> · T = sabit')]),
  ]);
  ekle('AYT', 'Modern Fiziğin Uygulamaları', [
    OQ('Yarı iletkenler ile ilgili,', [['Sıcaklık artınca iletkenlikleri artar.', true, 'Isı elektronları iletim bandına çıkarır.'], ['Katkılama ile iletkenlikleri değiştirilebilir.', true, 'N ve P tipi.'], ['Son yörüngelerinde 8 elektron bulunur.', false, 'Si ve Ge\'de 4 değerlik elektronu vardır.']],
      ['Yarı iletken: iletkenliği iletken ile yalıtkan arasında; Si, Ge.']),
    OQ('Lazer ışığı ile ilgili,', [['Uyarılmış emisyonla elde edilir.', true, 'LASER kısaltmasının anlamı.'], ['Tek renklidir.', true, 'Fotonlar aynı frekansta.'], ['Fotonları farklı fazlardadır.', false, 'Aynı fazlıdır (uyumlu).']],
      ['LASER: uyarılmış ışıma ile ışığın güçlendirilmesi.']),
  ]);
})();
