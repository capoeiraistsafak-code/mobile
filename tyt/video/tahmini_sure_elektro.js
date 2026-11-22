// Elektrostatik tuzak sorular: ses yokken tahmini bölüm süreleri (saniye). Ses gelince gerçek SYNC kullanılır.
(function () {
  const okuma = [15, 10, 11, 16, 11, 14, 10, 15, 13, 11];
  const segs = {intro: 8.2, outro: 7};
  okuma.forEach((r, i) => { segs[`p${i}r`] = r; [6, 6, 5, 4].forEach((d, k) => { segs[`p${i}s${k}`] = d; }); });
  window.SYNC = {segs, words: {}};
})();
