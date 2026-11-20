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
