// Bütün konu dosyaları yüklendikten sonra: "Tuzak sorular" görevleri her konunun soru listesinin EN SONUNA alınır
// ve görev numaraları sıraya göre yeniden verilir (yıldızlar yk anahtarıyla saklandığı için kaybolmaz).
(function () {
  const tuzakMi = m => m.tuzak || /^Tuzak/i.test(m.name || '');
  Object.values(FZ.HAZIR).forEach(h => {
    if (!h.gorevler) return;
    const L = h.gorevler.filter(m => !tuzakMi(m)).concat(h.gorevler.filter(tuzakMi));
    h.gorevler.length = 0; L.forEach(m => h.gorevler.push(m));
    h.gorevler.forEach((m, i) => { if (m.yk) m.no = i + 1; });
    (h.dersler || []).forEach((m, i) => { if (m.yk) m.no = i + 1; });
  });
  // ana menüdeki konu yıldız/soru sayıları, sonradan eklenen bütün görevlerle yeniden hesaplansın
  try { if (FZ.anaKur) FZ.anaKur(); } catch (e) {}
})();
