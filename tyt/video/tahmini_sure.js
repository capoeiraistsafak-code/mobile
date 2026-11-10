// Seslendirme gelene kadar tahmini bölüm süreleri (saniye). Hedef: ~5 dk.
// Ses üretilince bu dosyanın yerine senk.py'nin ürettiği gerçek SYNC (kelime zamanlarıyla) gelir.
(function () {
  const sayac = [3, 3, 3, 3, 4, 3, 4, 3];
  const segs = {intro: 8.2, outro: 8};
  sayac.forEach((n, i) => { segs[`p${i}r`] = 14; for (let k = 0; k < n; k++) segs[`p${i}s${k}`] = 5.5; });
  window.SYNC = {segs, words: {}};
})();
