// Soru çözümü videosu: seslendirme gelene kadar tahmini bölüm süreleri (saniye).
// Ses üretilince bunun yerine senk.py'nin ürettiği gerçek SYNC (kelime zamanlarıyla) gelir.
(function () {
  const okuma = [17, 16, 14, 13, 10, 15, 11, 18];   // soru kökü + öncüller
  const adim = [[7, 7, 5, 5], [7, 6, 5, 5], [7, 7, 6, 5], [6, 6, 7, 5], [7, 6, 6, 5], [7, 6, 7, 5], [7, 7, 6, 5], [7, 7, 6, 5]];
  const segs = {intro: 8.2, outro: 7};
  okuma.forEach((r, i) => { segs[`p${i}r`] = r; adim[i].forEach((d, k) => { segs[`p${i}s${k}`] = d; }); });
  window.SYNC = {segs, words: {}};
})();
