// Tuzak sorular videosu: seslendirme gelene kadar tahmini bölüm süreleri (saniye).
(function () {
  const okuma = [17, 9, 11, 14, 15, 18, 15, 17, 18, 13];
  const segs = {intro: 8.2, outro: 7};
  okuma.forEach((r, i) => { segs[`p${i}r`] = r; [7, 6, 6, 5].forEach((d, k) => { segs[`p${i}s${k}`] = d; }); });
  window.SYNC = {segs, words: {}};
})();
