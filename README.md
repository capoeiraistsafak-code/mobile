# mobile

- [Ödev Kontrol Programı](odev-kontrol/README.md): öğrencilerin ödev fotoğraflarını internetsiz kontrol eder. Açmak için `Ödev Kontrol.lnk` ya da `odev-kontrol/index.html`.

## Geliştirme

Programın kendisi `odev-kontrol/` klasöründedir (`index.html`, `style.css`, `app.js`, `vendor/`). Aşağıdakiler yalnızca geliştirme içindir ve Node.js gerektirir:

```bash
npm install
```

```bash
npm test
```

Bu komut, yapay test sayfalarıyla okuma doğruluğunu ölçer (`test/`).

```bash
npm run ogretici
```

Bu komut, `odev-kontrol/Ogretici` klasöründeki örnek dosyaları yeniden üretir.

```bash
npm run build
```

Bu komut, tek dosyalık `odev-kontrol/OdevKontrol.html` dosyasını üretir.

Yapay zekânın başlangıç eğitimi `odev-kontrol/YapayZeka/baslangic-modeli.js` dosyasını üretir. Önce işaret ve rakam ağları eğitilir. Bu adım MNIST klasörünü ister (Keras'ın mnist.npz dosyası açılmış hâlde):

```bash
node test/yz-egit.mjs <mnist-klasörü>
```

Ardından harf ağı eğitilir. Bu adım, @fontsource el yazısı yazı tiplerinin kurulu olduğu node_modules klasörünü ister:

```bash
node test/harf-egit.mjs <node_modules>
```

Deneme fotoğraflarını üretmek için:

```bash
node test/yazili-uret.mjs <mnist-klasörü>
```

```bash
node test/kelime-uret.mjs <node_modules>
```
