// Onay için kareler: giriş, kapak, her sayfanın son hâli (kamera kaymadan hemen önce), kamera geçişi ortası, kapanış.
// Kullanım: PAGE="$PWD/konu.html?k=<içerik>&s=<sync>" node kareler.js <çıktı_klasörü>
const {chromium} = require('playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  await p.goto('file://' + process.env.PAGE); await p.waitForFunction(() => window.DUR);
  const E = await p.evaluate(() => ({dur: DUR, moves: EVENTS.moves, segs: EVENTS.segs}));
  const shots = [['01_giris', 5.9], ['02_kapak', 7.6]];
  E.moves.forEach(([a, b2], i) => shots.push([`${String(i + 3).padStart(2, '0')}_soru${i + 1}`, a - 0.05]));
  shots.push([`${String(E.moves.length + 3).padStart(2, '0')}_soru${E.moves.length + 1}`, E.segs.outro - 0.5]);
  if (E.moves[0]) shots.push(['gecis_ortasi', (E.moves[0][0] + E.moves[0][1]) / 2]);
  shots.push(['zz_kapanis', E.dur - 1.5]);
  for (const [ad, t] of shots) { await p.evaluate(t => render(t), t); await p.screenshot({path: path.join(out, ad + '.png')}); }
  console.log('süre', E.dur.toFixed(1), 'sn ·', shots.length, 'kare'); await b.close();
})();
