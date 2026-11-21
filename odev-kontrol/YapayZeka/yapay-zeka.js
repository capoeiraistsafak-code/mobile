/* Ödev Kontrol — Yapay Zekâ (sinir ağları)
   TensorFlow.js (Keras ile aynı katman yapısı) ile iki küçük evrişimli sinir ağı (CNN):
     1) İşaret ağı : bir şıkkın çevresindeki el yazısı görüntüsüne bakıp şıkkın işaretli olup olmadığını söyler
                     (daire, tik, çarpı, altını çizme, karalama...).
     2) Rakam ağı  : öğrencinin elle yazdığı rakamları okur ("cevabı yazınız" soruları için).
   Ağlar başlangıçta bu bilgisayarda eğitilir (baslangic-modeli.js). Öğretmen sonuçları düzelttikçe
   yeni örnekler birikir ve ağ tarayıcının içinde kendini yeniden eğitir. Her şey internetsiz çalışır.
   Bu dosya hem programda (tarayıcı) hem de başlangıç eğitiminde (Node.js) aynen kullanılır. */
(function (kok, fabrika) {
  if (typeof module === "object" && module.exports) module.exports = fabrika;
  else kok.YapayZeka = fabrika(kok.tf);
})(typeof self !== "undefined" ? self : this, function (tf) {
  "use strict";

  const ISARET_Y = 24; // işaret görüntüsü: 24 x 48 piksel
  const ISARET_X = 48;
  const RAKAM = 28; // rakam ve harf görüntüsü: 28 x 28 piksel (MNIST biçimi)
  // Harf ağının sınıfları: 29 Türkçe harf + q, w, x. Büyük/küçük aynı sınıftır (I → ı, İ → i).
  const HARFLER = "abcçdefgğhıijklmnoöprsştuüvyzqwx";
  const harfSinifi = (ch) => HARFLER.indexOf(String(ch).toLocaleLowerCase("tr-TR"));

  // ---------------------------------------------------------------------------
  // Görüntü hazırlama (OpenCV gerektirmez; el yazısı haritası: 0 = boş, >0 = mürekkep)
  // ---------------------------------------------------------------------------

  /** Şık harfinin çevresindeki alanı 24x48'e küçültür (her hücre: mürekkep oranı x 255). */
  function isaretKirp(ink, W, H, box) {
    const h = box.y1 - box.y0;
    const x0 = Math.max(0, Math.round(box.x0));
    const x1 = Math.min(W, Math.round(Math.min(box.x1, box.x0 + 2.4 * h)));
    const y0 = Math.max(0, Math.round(box.y0));
    const y1 = Math.min(H, Math.round(box.y1));
    return alanOrtala(ink, W, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0), ISARET_X, ISARET_Y, (v) => (v ? 1 : 0));
  }

  /** Bir dikdörtgeni gw x gh ızgaraya alan ortalamasıyla küçültür. */
  function alanOrtala(kaynak, W, x0, y0, w, h, gw, gh, deger) {
    const out = new Uint8Array(gw * gh);
    for (let gy = 0; gy < gh; gy++) {
      const ya = y0 + (gy * h) / gh;
      const yb = y0 + ((gy + 1) * h) / gh;
      for (let gx = 0; gx < gw; gx++) {
        const xa = x0 + (gx * w) / gw;
        const xb = x0 + ((gx + 1) * w) / gw;
        let top = 0;
        let n = 0;
        for (let y = Math.floor(ya); y < Math.ceil(yb); y++)
          for (let x = Math.floor(xa); x < Math.ceil(xb); x++) {
            top += deger(kaynak[y * W + x]);
            n++;
          }
        out[gy * gw + gx] = n ? Math.round((top / n) * 255) : 0;
      }
    }
    return out;
  }

  /** Yazılı cevap alanındaki harfleri ayırır (i, ö, ü, ğ'nin noktaları/şapkaları harfine bağlanır). */
  const harfleriBul = (ink, W, H, r) => rakamlariBul(ink, W, H, r, true);

  /** Tek bir karakterin bütün mürekkebinden 28x28 görüntü (eğitim verisi için). */
  function tekParca(ink, W, H) {
    const noktalar = [];
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let i = 0; i < W * H; i++)
      if (ink[i]) {
        const x = i % W;
        const y = (i - x) / W;
        noktalar.push(i);
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    return noktalar.length ? mnistBicimi({ x0, y0, x1, y1, noktalar }, W) : null;
  }

  /** Yazılı cevap alanındaki rakamları ayırır; her biri MNIST biçiminde 28x28 görüntü olur. */
  function rakamlariBul(ink, W, H, r, harf = false) {
    const x0 = Math.max(0, Math.round(r.x0));
    const y0 = Math.max(0, Math.round(r.y0));
    const w = Math.min(W, Math.round(r.x1)) - x0;
    const h = Math.min(H, Math.round(r.y1)) - y0;
    if (w < 4 || h < 4) return [];
    const etiket = new Int32Array(w * h);
    const parcalar = [];
    const yigin = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (!ink[(y0 + y) * W + x0 + x] || etiket[y * w + x]) continue;
        const p = { id: parcalar.length + 1, x0: x, y0: y, x1: x, y1: y, n: 0, noktalar: [] };
        etiket[y * w + x] = p.id;
        yigin.push(y * w + x);
        while (yigin.length) {
          const i = yigin.pop();
          const px = i % w;
          const py = (i - px) / w;
          p.n++;
          p.noktalar.push(i);
          if (px < p.x0) p.x0 = px;
          if (px > p.x1) p.x1 = px;
          if (py < p.y0) p.y0 = py;
          if (py > p.y1) p.y1 = py;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = px + dx;
              const ny = py + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
              const j = ny * w + nx;
              if (!etiket[j] && ink[(y0 + ny) * W + x0 + nx]) {
                etiket[j] = p.id;
                yigin.push(j);
              }
            }
        }
        parcalar.push(p);
      }
    // Gürültüyü at: çok küçük ya da çok basık parçalar. Harflerde nokta ve şapkalar küçük olduğu için
    // küçük parçalar da tutulur; bir harfe bağlanamayanlar sonra atılır.
    const enBoy = Math.max(...parcalar.map((p) => p.y1 - p.y0 + 1), 1);
    let liste = harf ? parcalar.filter((p) => p.n >= 4) : parcalar.filter((p) => p.n >= 12 && p.y1 - p.y0 + 1 >= h * 0.2);
    // Kopuk küçük parçaları (ör. "5"in üst çizgisi) yanındaki rakama ekle. Boyları benzer iki parça
    // yatayda biraz üst üste binse de (eğik "1" ile "8" gibi) ayrı rakam sayılır.
    liste.sort((a, b) => a.x0 - b.x0);
    const gruplar = [];
    const boy = (p) => p.y1 - p.y0 + 1;
    for (const p of liste) {
      const g = gruplar[gruplar.length - 1];
      const ortak = g ? Math.min(g.x1, p.x1) - Math.max(g.x0, p.x0) : -1;
      const kucukParca = g && Math.min(boy(g), boy(p)) < 0.6 * Math.max(boy(g), boy(p));
      if (g && kucukParca && ortak > 0.5 * Math.min(g.x1 - g.x0 + 1, p.x1 - p.x0 + 1)) {
        g.x0 = Math.min(g.x0, p.x0);
        g.x1 = Math.max(g.x1, p.x1);
        g.y0 = Math.min(g.y0, p.y0);
        g.y1 = Math.max(g.y1, p.y1);
        g.noktalar.push(...p.noktalar);
        g.n += p.n;
      } else gruplar.push({ ...p, noktalar: [...p.noktalar] });
    }
    // Bitişik yazılmış rakamlar (ör. "80") tek parça görünür. Geniş parçalar için bölünmüş hâli de
    // hazırlanır (mürekkebin en ince olduğu dikey çizgilerden); hangisinin doğru olduğuna rakam ağı karar verir.
    const parcaYap = (g) => ({ kutu: { x0: x0 + g.x0, y0: y0 + g.y0, x1: x0 + g.x1 + 1, y1: y0 + g.y1 + 1 }, x: mnistBicimi(g, w) });
    const kalan = harf ? gruplar.filter((g) => g.y1 - g.y0 + 1 >= enBoy * 0.3 && g.n >= 12) : gruplar;
    return kalan.map((g) => {
      const gw = g.x1 - g.x0 + 1;
      const gh = g.y1 - g.y0 + 1;
      const parca = parcaYap(g);
      if (gw > 1.1 * gh) {
        const b = bol(g, Math.max(2, Math.round(gw / (0.8 * gh))));
        if (b.length >= 2) parca.bolunmus = b.map(parcaYap);
      }
      return parca;
    });

    function bol(g, adet) {
      const ayrik = [];
      const gw = g.x1 - g.x0 + 1;
      const sutun = new Array(gw).fill(0);
      for (const i of g.noktalar) sutun[(i % w) - g.x0]++;
      const kesimler = [];
      for (let k = 1; k < adet; k++) {
        const merkez = Math.round((k * gw) / adet);
        let en = merkez;
        for (let x = Math.max(1, merkez - Math.round(gw / adet / 3)); x <= Math.min(gw - 2, merkez + Math.round(gw / adet / 3)); x++) if (sutun[x] < sutun[en]) en = x;
        kesimler.push(g.x0 + en);
      }
      const sinirlar = [g.x0, ...kesimler, g.x1 + 1];
      for (let k = 0; k < adet; k++) {
        const noktalar = g.noktalar.filter((i) => i % w >= sinirlar[k] && i % w < sinirlar[k + 1]);
        if (noktalar.length < 8) continue;
        const xs = noktalar.map((i) => i % w);
        const ys = noktalar.map((i) => (i - (i % w)) / w);
        ayrik.push({ x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), n: noktalar.length, noktalar });
      }
      return ayrik;
    }
  }

  /** Bir parçayı MNIST gibi hazırlar: en uzun kenar 20 piksel, kütle merkezi ortada, 28x28. */
  function mnistBicimi(g, w) {
    const gw = g.x1 - g.x0 + 1;
    const gh = g.y1 - g.y0 + 1;
    const maske = new Uint8Array(gw * gh);
    for (const i of g.noktalar) {
      const px = i % w;
      const py = (i - px) / w;
      maske[(py - g.y0) * gw + (px - g.x0)] = 1;
    }
    const s = 20 / Math.max(gw, gh);
    const nw = Math.max(1, Math.round(gw * s));
    const nh = Math.max(1, Math.round(gh * s));
    const kucuk = alanOrtala(maske, gw, 0, 0, gw, gh, nw, nh, (v) => v);
    // İnce kalemle yazılmış rakamları MNIST kalınlığına yaklaştır (1 piksel kalınlaştır).
    const kalin = new Uint8Array(nw * nh);
    for (let y = 0; y < nh; y++)
      for (let x = 0; x < nw; x++) {
        let m = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx >= 0 && yy >= 0 && xx < nw && yy < nh) m = Math.max(m, kucuk[yy * nw + xx] * (dx || dy ? 0.6 : 1));
          }
        kalin[y * nw + x] = Math.min(255, m);
      }
    let top = 0;
    let mx = 0;
    let my = 0;
    for (let y = 0; y < nh; y++)
      for (let x = 0; x < nw; x++) {
        const v = kalin[y * nw + x];
        top += v;
        mx += v * x;
        my += v * y;
      }
    const ox = Math.round(14 - (top ? mx / top : nw / 2));
    const oy = Math.round(14 - (top ? my / top : nh / 2));
    const out = new Uint8Array(RAKAM * RAKAM);
    for (let y = 0; y < nh; y++)
      for (let x = 0; x < nw; x++) {
        const tx = x + Math.min(28 - nw, Math.max(0, ox));
        const ty = y + Math.min(28 - nh, Math.max(0, oy));
        out[ty * RAKAM + tx] = kalin[y * nw + x];
      }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Sinir ağları (Keras ile aynı katmanlar)
  // ---------------------------------------------------------------------------
  function isaretModeliKur() {
    const m = tf.sequential({ name: "isaret_agi" });
    m.add(tf.layers.conv2d({ inputShape: [ISARET_Y, ISARET_X, 1], filters: 8, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.conv2d({ filters: 16, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.flatten());
    m.add(tf.layers.dense({ units: 32, activation: "relu" }));
    m.add(tf.layers.dropout({ rate: 0.2 }));
    m.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
    return m;
  }
  function rakamModeliKur() {
    const m = tf.sequential({ name: "rakam_agi" });
    m.add(tf.layers.conv2d({ inputShape: [RAKAM, RAKAM, 1], filters: 16, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.flatten());
    m.add(tf.layers.dense({ units: 64, activation: "relu" }));
    m.add(tf.layers.dropout({ rate: 0.3 }));
    m.add(tf.layers.dense({ units: 10, activation: "softmax" }));
    return m;
  }
  function harfModeliKur() {
    const m = tf.sequential({ name: "harf_agi" });
    m.add(tf.layers.conv2d({ inputShape: [RAKAM, RAKAM, 1], filters: 32, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu", padding: "same" }));
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.flatten());
    m.add(tf.layers.dense({ units: 128, activation: "relu" }));
    m.add(tf.layers.dropout({ rate: 0.4 }));
    m.add(tf.layers.dense({ units: HARFLER.length, activation: "softmax" }));
    return m;
  }
  function derle(m, tur, ogrenmeOrani) {
    m.compile({
      optimizer: tf.train.adam(ogrenmeOrani),
      loss: tur === "isaret" ? "binaryCrossentropy" : "sparseCategoricalCrossentropy",
      metrics: ["accuracy"],
    });
  }
  const boyut = (tur) => (tur === "isaret" ? [ISARET_Y, ISARET_X] : [RAKAM, RAKAM]); // rakam ve harf: 28x28

  function tensor(tur, xs) {
    const [h, w] = boyut(tur);
    const veri = new Float32Array(xs.length * h * w);
    xs.forEach((x, i) => {
      for (let j = 0; j < h * w; j++) veri[i * h * w + j] = x[j] / 255;
    });
    return tf.tensor4d(veri, [xs.length, h, w, 1]);
  }

  /** İşaret ağı: her görüntü için "işaretli" olasılığı (0-1). */
  async function isaretTahmin(model, xs) {
    if (!xs.length) return [];
    const t = tensor("isaret", xs);
    const y = model.predict(t);
    const p = Array.from(await y.data());
    t.dispose();
    y.dispose();
    return p;
  }
  /** Harf ağı: her görüntü için {harf, p, olasilik: Float32Array(32)}. */
  async function harfTahmin(model, xs) {
    if (!xs.length) return [];
    const t = tensor("harf", xs);
    const y = model.predict(t);
    const v = await y.data();
    t.dispose();
    y.dispose();
    const K = HARFLER.length;
    return xs.map((_, i) => {
      const olasilik = v.slice(i * K, i * K + K);
      let en = 0;
      for (let k = 1; k < K; k++) if (olasilik[k] > olasilik[en]) en = k;
      return { harf: HARFLER[en], sinif: en, p: olasilik[en], olasilik };
    });
  }

  /** Kelimeyi karşılaştırmak için sadeleştirir: küçük harf, boşluk ve noktalama yok. */
  const sadeKelime = (s) => [...String(s ?? "").toLocaleLowerCase("tr-TR")].filter((c) => HARFLER.includes(c)).join("");

  /**
   * Bir yazılı kelime cevabını okur ve beklenen cevaba benzerliğini hesaplar.
   * Benzerlik: her parçanın beklenen harf olma olasılığıyla yapılan hizalama (eksik/fazla harf = 1 ceza).
   * Sonuç: {harfler: [{kutu, x, harf, p}], metin, guven, benzerlik (0-1)}
   */
  async function kelimeOku(model, parcalar, beklenen = "") {
    // Geniş parçalarda bölünmüş hâli de dene; harf ağı hangisinden daha eminse onu seç.
    const secilen = [];
    for (const p of parcalar) {
      const [tek] = await harfTahmin(model, [p.x]);
      let secim = [{ ...p, ...tek }];
      if (p.bolunmus) {
        const t = await harfTahmin(model, p.bolunmus.map((b) => b.x));
        if (Math.min(...t.map((x) => x.p)) > tek.p) secim = p.bolunmus.map((b, i) => ({ ...b, ...t[i] }));
      }
      secilen.push(...secim);
    }
    const metin = secilen.map((h) => h.harf).join("");
    const guven = secilen.length ? Math.min(...secilen.map((h) => h.p)) : 0;
    const hedef = sadeKelime(beklenen);
    let benzerlik = null;
    if (hedef) {
      const n = secilen.length;
      const m = hedef.length;
      const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
      for (let i = 1; i <= n; i++)
        for (let j = 1; j <= m; j++) {
          // Beklenen harf, ağın en olası bulduğu harfe ne kadar yakınsa ceza o kadar az.
          const h = secilen[i - 1];
          const p = Math.min(1, h.olasilik[HARFLER.indexOf(hedef[j - 1])] / h.p);
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (1 - p));
        }
      benzerlik = Math.max(0, 1 - d[n][m] / Math.max(n, m));
    }
    return { harfler: secilen.map(({ kutu, x, harf, p }) => ({ kutu, x, harf, p })), metin, guven, benzerlik };
  }

  /** Rakam ağı: her görüntü için {rakam, p}. */
  async function rakamTahmin(model, xs) {
    if (!xs.length) return [];
    const t = tensor("rakam", xs);
    const y = model.predict(t);
    const v = await y.data();
    t.dispose();
    y.dispose();
    return xs.map((_, i) => {
      let en = 0;
      for (let k = 1; k < 10; k++) if (v[i * 10 + k] > v[i * 10 + en]) en = k;
      return { rakam: en, p: v[i * 10 + en] };
    });
  }

  /**
   * Bir yazılı cevabın parçalarını okur. Geniş parçalarda bölünmüş hâl de denenir; rakam ağı
   * hangisinden daha eminse o seçilir. Sonuç: {rakamlar: [{kutu, x, rakam, p}], metin, guven}
   */
  async function sayiOku(model, parcalar) {
    const rakamlar = [];
    for (const p of parcalar) {
      const [tek] = await rakamTahmin(model, [p.x]);
      let secim = [{ ...p, ...tek }];
      if (p.bolunmus) {
        const t = await rakamTahmin(model, p.bolunmus.map((b) => b.x));
        const bolunmusGuven = Math.min(...t.map((x) => x.p));
        if (bolunmusGuven > tek.p) secim = p.bolunmus.map((b, i) => ({ ...b, ...t[i] }));
      }
      rakamlar.push(...secim.map(({ kutu, x, rakam, p: g }) => ({ kutu, x, rakam, p: g })));
    }
    return { rakamlar, metin: rakamlar.map((r) => r.rakam).join(""), guven: rakamlar.length ? Math.min(...rakamlar.map((r) => r.p)) : 0 };
  }

  /** Eğitim sırasında örnekleri çeşitlendirir: kaydırma, kalınlaştırma, inceltme. */
  function cesitlendir(tur, x) {
    const [h, w] = boyut(tur);
    const dx = Math.round((Math.random() - 0.5) * (tur === "isaret" ? 6 : 4));
    const dy = Math.round((Math.random() - 0.5) * (tur === "isaret" ? 4 : 4));
    const r = Math.random();
    const out = new Uint8Array(h * w);
    for (let y = 0; y < h; y++)
      for (let xx = 0; xx < w; xx++) {
        const sx = xx - dx;
        const sy = y - dy;
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
        let v = x[sy * w + sx];
        if (r < 0.25 || r > 0.75) {
          // komşulara bak: kalınlaştır (en büyük) ya da incelt (en küçük)
          for (let a = -1; a <= 1; a++)
            for (let b = -1; b <= 1; b++) {
              if (!a && !b) continue;
              const nx = sx + b;
              const ny = sy + a;
              const nv = nx < 0 || ny < 0 || nx >= w || ny >= h ? 0 : x[ny * w + nx];
              v = r < 0.25 ? Math.max(v, nv * 0.7) : Math.min(v, nv + 40);
            }
        }
        out[y * w + xx] = v;
      }
    return out;
  }

  /**
   * Ağı örneklerle eğitir. ornekler: [{x: Uint8Array, y: 0/1 ya da 0-9, agirlik?}]
   * Sonuç: {kayip, dogruluk}
   */
  async function egit(model, tur, ornekler, { epoch = 6, ogrenmeOrani = 0.001, cesit = true, ilerleme } = {}) {
    derle(model, tur, ogrenmeOrani);
    // Ağırlıklı örnekler (ör. öğretmen düzeltmeleri) eğitimde o kadar kez tekrarlanır.
    const coklu = ornekler.flatMap((o) => Array(Math.max(1, Math.round(o.agirlik || 1))).fill(o));
    const karisik = coklu.sort(() => Math.random() - 0.5);
    const xs = tensor(tur, karisik.map((o) => (cesit && Math.random() < 0.6 ? cesitlendir(tur, o.x) : o.x)));
    const ys = tf.tensor2d(karisik.map((o) => [o.y]), [karisik.length, 1]);
    let son = {};
    await model.fit(xs, ys, {
      epochs: epoch,
      batchSize: 32,
      shuffle: true,
      verbose: 0,
      callbacks: {
        onEpochEnd: async (e, l) => {
          son = l;
          if (ilerleme) await ilerleme(e + 1, epoch, l);
        },
      },
    });
    xs.dispose();
    ys.dispose();
    return { kayip: son.loss, dogruluk: son.acc ?? son.accuracy };
  }

  /** Ağın bir örnek kümesindeki doğruluğu (0-1). */
  async function dogruluk(model, tur, ornekler) {
    if (!ornekler.length) return null;
    const xs = ornekler.map((o) => o.x);
    if (tur === "isaret") {
      const p = await isaretTahmin(model, xs);
      return p.filter((v, i) => (v >= 0.5 ? 1 : 0) === ornekler[i].y).length / ornekler.length;
    }
    if (tur === "harf") {
      const t = await harfTahmin(model, xs);
      return t.filter((v, i) => v.sinif === ornekler[i].y).length / ornekler.length;
    }
    const t = await rakamTahmin(model, xs);
    return t.filter((v, i) => v.rakam === ornekler[i].y).length / ornekler.length;
  }

  // ---------------------------------------------------------------------------
  // Kaydetme / yükleme (yedekleme için)
  // ---------------------------------------------------------------------------
  const b64 = {
    yaz(buf) {
      const u = new Uint8Array(buf);
      if (typeof Buffer !== "undefined") return Buffer.from(u).toString("base64");
      let s = "";
      for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(s);
    },
    oku(s) {
      if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(s, "base64"));
      return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    },
  };
  /** Modeli düz bir nesneye çevirir: {modelTopology, weightSpecs, weightData(base64)} */
  async function modelPaketle(model) {
    let paket;
    await model.save(
      tf.io.withSaveHandler(async (a) => {
        paket = { modelTopology: a.modelTopology, weightSpecs: a.weightSpecs, weightData: b64.yaz(a.weightData) };
        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: "JSON" } };
      })
    );
    return paket;
  }
  async function modelAc(paket) {
    const data = b64.oku(paket.weightData);
    return tf.loadLayersModel(
      tf.io.fromMemory({ modelTopology: paket.modelTopology, weightSpecs: paket.weightSpecs, weightData: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) })
    );
  }

  return {
    ISARET_Y, ISARET_X, RAKAM, HARFLER, harfSinifi, sadeKelime,
    isaretKirp, rakamlariBul, harfleriBul, tekParca,
    isaretModeliKur, rakamModeliKur, harfModeliKur,
    isaretTahmin, rakamTahmin, harfTahmin, sayiOku, kelimeOku, egit, dogruluk,
    modelPaketle, modelAc, b64,
  };
});
