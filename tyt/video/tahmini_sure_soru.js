// Soru çözümü videosu: seslendirme gelene kadar tahmini bölüm süreleri (saniye). Hedef: ~5 dk.
// Ses üretilince bunun yerine senk.py'nin ürettiği gerçek SYNC (kelime zamanlarıyla) gelir.
(function () {
  const okuma = [16, 15, 9, 13, 15, 12, 12, 17];   // soru kökü + şıklar
  const adim = [[7, 7, 6, 5], [6, 6, 5, 5], [7, 6, 7, 5], [7, 6, 8, 5], [7, 6, 6, 5], [7, 6, 8, 5], [5, 5, 5, 5, 5], [7, 7, 6, 5]];
  const segs = {intro: 8.2, outro: 7};
  okuma.forEach((r, i) => { segs[`p${i}r`] = r; adim[i].forEach((d, k) => { segs[`p${i}s${k}`] = d; }); });
  window.SYNC = {segs, words: {}};
})();
